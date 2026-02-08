import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Users as UsersIcon, Search, Filter, ChevronLeft, ChevronRight, 
  MoreVertical, Shield, Loader2, Mail, Calendar, Check, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const ROLES = ['member', 'leader', 'admin', 'super_admin'] as const;
type Role = typeof ROLES[number];

const getRoleBadgeStyles = (role?: string | null) => {
  switch (role) {
    case 'super_admin': return 'bg-red-100 text-red-700 border-red-200';
    case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'leader': return 'bg-teal-100 text-teal-700 border-teal-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatRoleName = (role?: string | null) => {
  if (!role) return 'Member';
  return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [roleChangeDialog, setRoleChangeDialog] = useState<{ user: User; newRole: Role } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth() as { user: User | null };
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/admin/users", { page, pageSize, search: searchQuery, role: roleFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.set('search', searchQuery);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const roleChangeMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Role updated",
        description: "User role has been successfully changed.",
      });
      setRoleChangeDialog(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRoleChange = (user: User, newRole: Role) => {
    if (user.id === currentUser?.id) {
      toast({
        title: "Cannot change own role",
        description: "You cannot change your own role.",
        variant: "destructive",
      });
      return;
    }
    setRoleChangeDialog({ user, newRole });
  };

  const confirmRoleChange = () => {
    if (roleChangeDialog) {
      roleChangeMutation.mutate({
        userId: roleChangeDialog.user.id,
        role: roleChangeDialog.newRole,
      });
    }
  };

  return (
    <AdminLayout 
      title="Users Directory" 
      subtitle={`${data?.total || 0} registered users`}
      breadcrumbs={[{ label: "Users & Roles", href: "/admin/users" }, { label: "All Users" }]}
    >
      <Card className="border-0 shadow-sm mb-6" data-testid="card-users-filters">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-role-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="option-role-all">All Roles</SelectItem>
                {ROLES.map(role => (
                  <SelectItem key={role} value={role} data-testid={`option-role-${role}`}>
                    {formatRoleName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
        </div>
      ) : users.length === 0 ? (
        <Card className="border-0 shadow-sm" data-testid="card-no-users">
          <CardContent className="p-12 text-center">
            <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchQuery || roleFilter !== 'all' 
                ? "Try adjusting your search or filter criteria." 
                : "Users will appear here when they sign up."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-users-table">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-users">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">User</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Joined</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50"
                      data-testid={`row-user-${user.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt="" 
                              className="h-10 w-10 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#1a2744]/10 flex items-center justify-center">
                              <UsersIcon className="h-5 w-5 text-[#1a2744]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900" data-testid={`text-user-name-${user.id}`}>
                              {user.firstName || "Unknown"} {user.lastName || ""}
                            </p>
                            <p className="text-xs text-gray-500 md:hidden">{user.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span data-testid={`text-user-email-${user.id}`}>{user.email || "No email"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant="outline"
                          className={`${getRoleBadgeStyles(user.role)}`}
                          data-testid={`badge-user-role-${user.id}`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {formatRoleName(user.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span data-testid={`text-user-joined-${user.id}`}>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              data-testid={`button-user-actions-${user.id}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {isSuperAdmin && (
                              <>
                                <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                                  Change Role
                                </DropdownMenuLabel>
                                {ROLES.map(role => (
                                  <DropdownMenuItem
                                    key={role}
                                    onClick={() => handleRoleChange(user, role)}
                                    disabled={user.role === role || user.id === currentUser?.id}
                                    className={user.role === role ? "bg-gray-100" : ""}
                                    data-testid={`button-change-role-${user.id}-${role}`}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {formatRoleName(role)}
                                    {user.role === role && <Check className="h-4 w-4 ml-auto" />}
                                  </DropdownMenuItem>
                                ))}
                              </>
                            )}
                            {!isSuperAdmin && (
                              <DropdownMenuItem disabled className="text-gray-400">
                                <Shield className="h-4 w-4 mr-2" />
                                Role changes require Super Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4" data-testid="pagination">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} ({data?.total} total users)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-testid="button-next-page"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!roleChangeDialog} onOpenChange={() => setRoleChangeDialog(null)}>
        <AlertDialogContent data-testid="dialog-confirm-role-change">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change <strong>{roleChangeDialog?.user.firstName} {roleChangeDialog?.user.lastName}</strong>'s 
              role from <Badge variant="outline" className={getRoleBadgeStyles(roleChangeDialog?.user.role)}>
                {formatRoleName(roleChangeDialog?.user.role)}
              </Badge> to <Badge variant="outline" className={getRoleBadgeStyles(roleChangeDialog?.newRole)}>
                {formatRoleName(roleChangeDialog?.newRole)}
              </Badge>?
              <br /><br />
              This action will be logged in the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-role-change">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRoleChange}
              className="bg-[#1a2744] hover:bg-[#1a2744]/90"
              disabled={roleChangeMutation.isPending}
              data-testid="button-confirm-role-change"
            >
              {roleChangeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

export default AdminUsers;
