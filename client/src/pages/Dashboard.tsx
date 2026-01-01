import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Spark, Event, Post } from "@shared/schema";
import { 
  Target, Flame, Calendar, Users, BookOpen, 
  GripVertical, Settings, Check, Plus, TrendingUp,
  Heart, Clock, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type WidgetType = 'goals' | 'habits' | 'events' | 'sparks' | 'community' | 'stats';

interface Widget {
  id: WidgetType;
  title: string;
  icon: typeof Target;
  visible: boolean;
  order: number;
}

const defaultWidgets: Widget[] = [
  { id: 'stats', title: 'My Progress', icon: TrendingUp, visible: true, order: 0 },
  { id: 'habits', title: 'Daily Habits', icon: Check, visible: true, order: 1 },
  { id: 'goals', title: 'My Goals', icon: Target, visible: true, order: 2 },
  { id: 'sparks', title: 'Today\'s Spark', icon: Flame, visible: true, order: 3 },
  { id: 'events', title: 'Upcoming Events', icon: Calendar, visible: true, order: 4 },
  { id: 'community', title: 'Community', icon: Users, visible: true, order: 5 },
];

function StatsWidget() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-card dark:bg-gray-800 rounded-2xl p-4 border-2 border-border text-center">
        <Clock className="h-5 w-5 text-accent mx-auto mb-2" />
        <div className="text-xl font-bold text-foreground">12</div>
        <div className="text-[10px] text-muted-foreground">Days Active</div>
      </div>
      <div className="bg-card dark:bg-gray-800 rounded-2xl p-4 border-2 border-border text-center">
        <Heart className="h-5 w-5 text-red-400 mx-auto mb-2" />
        <div className="text-xl font-bold text-foreground">47</div>
        <div className="text-[10px] text-muted-foreground">Prayers</div>
      </div>
      <div className="bg-card dark:bg-gray-800 rounded-2xl p-4 border-2 border-border text-center">
        <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-2" />
        <div className="text-xl font-bold text-foreground">320</div>
        <div className="text-[10px] text-muted-foreground">Impact</div>
      </div>
    </div>
  );
}

function HabitsWidget() {
  const { data: goals } = useQuery<any[]>({
    queryKey: ['/api', 'goals'],
  });

  const habits = goals?.flatMap((g: any) => g.habits) || [];
  const uniqueHabits = habits.filter((h: any, i: number, arr: any[]) => 
    arr.findIndex(x => x.id === h.id) === i
  );

  const queryClient = useQueryClient();
  const toggleMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const today = new Date().toISOString().split('T')[0];
      const habit = uniqueHabits.find((h: any) => h.id === habitId);
      const res = await apiRequest('POST', `/api/habits/${habitId}/toggle`, { 
        date: today, 
        completed: !habit?.completedToday 
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api', 'goals'] }),
  });

  if (uniqueHabits.length === 0) {
    return (
      <div className="text-center py-6">
        <Check className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">No habits yet</p>
        <Link href="/goals">
          <Button size="sm" className="rounded-full" data-testid="add-habit-button">
            <Plus className="h-4 w-4 mr-1" /> Add Habit
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {uniqueHabits.slice(0, 4).map((habit: any) => (
        <button
          key={habit.id}
          onClick={() => toggleMutation.mutate(habit.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
            habit.completedToday 
              ? 'bg-green-500/10 border-2 border-green-500/30' 
              : 'bg-muted/50 dark:bg-gray-800 border-2 border-transparent hover:border-primary/20'
          }`}
          data-testid={`habit-toggle-${habit.id}`}
        >
          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
            habit.completedToday 
              ? 'bg-green-500 border-green-500' 
              : 'border-muted-foreground'
          }`}>
            {habit.completedToday && <Check className="h-4 w-4 text-white" />}
          </div>
          <span className={`flex-1 text-left text-sm font-medium ${
            habit.completedToday ? 'text-green-600 dark:text-green-400 line-through' : 'text-foreground'
          }`}>
            {habit.title}
          </span>
          {habit.streak > 0 && (
            <span className="text-xs text-amber-500 font-bold">{habit.streak} days</span>
          )}
        </button>
      ))}
      {uniqueHabits.length > 4 && (
        <Link href="/goals">
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
            View all {uniqueHabits.length} habits
          </Button>
        </Link>
      )}
    </div>
  );
}

function GoalsWidget() {
  const { data: goals } = useQuery<any[]>({
    queryKey: ['/api', 'goals'],
  });

  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-6">
        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">Set your first goal</p>
        <Link href="/goals">
          <Button size="sm" className="rounded-full" data-testid="add-goal-button">
            <Plus className="h-4 w-4 mr-1" /> Add Goal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {goals.slice(0, 3).map((goal: any) => (
        <Link key={goal.id} href="/goals">
          <div className="p-3 rounded-xl bg-muted/50 dark:bg-gray-800 border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-foreground">{goal.title}</span>
              <span className="text-xs text-primary font-bold">{goal.progress}%</span>
            </div>
            <div className="h-2 bg-muted dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SparksWidget() {
  const { data: sparks } = useQuery<Spark[]>({
    queryKey: ['/api', 'sparks'],
  });

  const todaySpark = sparks?.[0];

  if (!todaySpark) {
    return (
      <div className="text-center py-6">
        <Flame className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No sparks available</p>
      </div>
    );
  }

  return (
    <Link href="/sparks">
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/20 cursor-pointer hover:border-amber-500/40 transition-all">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Flame className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-foreground text-sm mb-1 truncate">{todaySpark.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{todaySpark.description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

function EventsWidget() {
  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api', 'events'],
  });

  const upcomingEvents = events?.filter((e: any) => new Date(e.startDate) > new Date()).slice(0, 2);

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingEvents.map((event: any) => (
        <div key={event.id} className="p-3 rounded-xl bg-muted/50 dark:bg-gray-800 border-2 border-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {new Date(event.startDate).toLocaleDateString('en', { month: 'short' })}
              </span>
              <span className="text-sm font-bold text-primary">
                {new Date(event.startDate).getDate()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-sm truncate">{event.title}</h4>
              <p className="text-xs text-muted-foreground">{event.location || 'Online'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommunityWidget() {
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api', 'posts'],
  });

  const recentPosts = posts?.slice(0, 2);

  if (!recentPosts || recentPosts.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">Join the community</p>
        <Link href="/community">
          <Button size="sm" className="rounded-full" data-testid="join-community-button">
            Visit Hub
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentPosts.map((post: any) => (
        <Link key={post.id} href="/community">
          <div className="p-3 rounded-xl bg-muted/50 dark:bg-gray-800 border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
                <span className="text-xs text-muted-foreground mt-1">
                  {post.type === 'prayer' ? 'Prayer Request' : 'Mission Update'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

const widgetComponents: Record<WidgetType, React.FC> = {
  stats: StatsWidget,
  habits: HabitsWidget,
  goals: GoalsWidget,
  sparks: SparksWidget,
  events: EventsWidget,
  community: CommunityWidget,
};

export function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<WidgetType | null>(null);

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);

  const handleDragStart = (id: WidgetType) => {
    setDraggedWidget(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: WidgetType) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    setWidgets(prev => {
      const newWidgets = [...prev];
      const draggedIdx = newWidgets.findIndex(w => w.id === draggedWidget);
      const targetIdx = newWidgets.findIndex(w => w.id === targetId);
      
      const draggedOrder = newWidgets[draggedIdx].order;
      newWidgets[draggedIdx].order = newWidgets[targetIdx].order;
      newWidgets[targetIdx].order = draggedOrder;
      
      return newWidgets;
    });
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const toggleWidgetVisibility = (id: WidgetType) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">Your personalized view</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`rounded-full ${isCustomizing ? 'bg-primary text-primary-foreground' : ''}`}
              data-testid="customize-dashboard-button"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </motion.div>

          {isCustomizing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-card dark:bg-gray-800 rounded-2xl border-2 border-border"
            >
              <p className="text-sm font-medium text-foreground mb-3">Toggle widgets:</p>
              <div className="grid grid-cols-2 gap-2">
                {widgets.map(widget => (
                  <button
                    key={widget.id}
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-sm font-medium transition-all ${
                      widget.visible 
                        ? 'bg-primary/10 text-primary border-2 border-primary/30' 
                        : 'bg-muted text-muted-foreground border-2 border-transparent'
                    }`}
                    data-testid={`toggle-widget-${widget.id}`}
                  >
                    <widget.icon className="h-4 w-4" />
                    {widget.title}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Drag widgets below to reorder them
              </p>
            </motion.div>
          )}

          <div className="space-y-4">
            {visibleWidgets.map((widget, index) => {
              const WidgetComponent = widgetComponents[widget.id];
              return (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  draggable={isCustomizing}
                  onDragStart={() => handleDragStart(widget.id)}
                  onDragOver={(e) => handleDragOver(e, widget.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-card dark:bg-gray-900 rounded-2xl border-2 border-border shadow-sm overflow-hidden ${
                    isCustomizing ? 'cursor-grab active:cursor-grabbing' : ''
                  } ${draggedWidget === widget.id ? 'opacity-50' : ''}`}
                  data-testid={`widget-${widget.id}`}
                >
                  <div className="flex items-center gap-2 p-4 border-b border-border">
                    {isCustomizing && (
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    )}
                    <widget.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground text-sm">{widget.title}</h3>
                  </div>
                  <div className="p-4">
                    <WidgetComponent />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
