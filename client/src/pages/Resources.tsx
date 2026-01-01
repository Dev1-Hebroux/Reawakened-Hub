import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  FileText, Video, Headphones, Download, Search, Filter,
  ExternalLink, Clock, User, BookOpen, Loader2
} from "lucide-react";
import type { Resource } from "@shared/schema";

const resourceTypes = [
  { value: "all", label: "All", icon: BookOpen },
  { value: "article", label: "Articles", icon: FileText },
  { value: "video", label: "Videos", icon: Video },
  { value: "podcast", label: "Podcasts", icon: Headphones },
  { value: "download", label: "Downloads", icon: Download },
];

const categories = [
  { value: "all", label: "All Topics" },
  { value: "faith", label: "Faith & Prayer" },
  { value: "discipleship", label: "Discipleship" },
  { value: "missions", label: "Missions" },
  { value: "leadership", label: "Leadership" },
  { value: "wellness", label: "Wellness" },
  { value: "relationships", label: "Relationships" },
];

function ResourceCard({ resource }: { resource: Resource }) {
  const TypeIcon = resourceTypes.find(t => t.value === resource.type)?.icon || FileText;
  
  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border-2 border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all hover:-translate-y-1"
      data-testid={`resource-card-${resource.id}`}
    >
      {resource.thumbnailUrl && (
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <img 
            src={resource.thumbnailUrl} 
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
            resource.type === 'video' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            resource.type === 'podcast' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
            resource.type === 'download' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            <TypeIcon className="h-3 w-3" />
            {resource.type}
          </span>
          {resource.isFeatured && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Featured
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {resource.title}
        </h3>
        
        {resource.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {resource.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-3">
            {resource.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {resource.author}
              </span>
            )}
            {resource.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resource.duration}
              </span>
            )}
          </div>
          <ExternalLink className="h-4 w-4 text-primary" />
        </div>
      </div>
    </motion.a>
  );
}

export function Resources() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api", "resources", selectedType !== "all" ? selectedType : "", selectedCategory !== "all" ? selectedCategory : ""],
  });

  const filteredResources = resources?.filter(resource => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        resource.title.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.author?.toLowerCase().includes(query) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  }) || [];

  const featuredResources = filteredResources.filter(r => r.isFeatured);
  const regularResources = filteredResources.filter(r => !r.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Resources Library
            </h1>
            <p className="text-muted-foreground">
              Curated articles, videos, and podcasts for your growth journey
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-card dark:bg-gray-800 border-2"
                data-testid="resource-search"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {resourceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedType === type.value
                      ? 'bg-primary text-white'
                      : 'bg-card dark:bg-gray-800 text-muted-foreground hover:bg-muted'
                  }`}
                  data-testid={`filter-type-${type.value}`}
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.value
                      ? 'bg-secondary text-secondary-foreground border-2 border-primary'
                      : 'bg-card dark:bg-gray-800 text-muted-foreground hover:bg-muted border-2 border-transparent'
                  }`}
                  data-testid={`filter-category-${category.value}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredResources.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-card dark:bg-gray-800 rounded-2xl border-2 border-border"
            >
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "Check back soon for new content"}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-8">
              {featuredResources.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-amber-500">★</span> Featured
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {featuredResources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              )}

              {regularResources.length > 0 && (
                <div>
                  {featuredResources.length > 0 && (
                    <h2 className="text-lg font-bold text-foreground mb-4">All Resources</h2>
                  )}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {regularResources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
