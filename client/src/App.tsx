import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AboutPage from "@/pages/About";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPost";
import { CommunityHub } from "@/pages/CommunityHub";
import { SparksPage } from "@/pages/Sparks";
import { MissionPage } from "@/pages/Mission";
import { JourneyLibrary } from "@/pages/JourneyLibrary";
import { JourneyDetail } from "@/pages/JourneyDetail";
import { JourneyDayPage } from "@/pages/JourneyDay";
import { MobileNav } from "@/components/layout/MobileNav";
import { QuickShare } from "@/components/ui/QuickShare";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/community" component={CommunityHub} />
      <Route path="/sparks" component={SparksPage} />
      <Route path="/mission" component={MissionPage} />
      <Route path="/journeys" component={JourneyLibrary} />
      <Route path="/journeys/:slug" component={JourneyDetail} />
      <Route path="/journey/:userJourneyId/day/:dayNumber" component={JourneyDayPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dove-background min-h-screen relative">
          <Toaster />
          <Router />
          <MobileNav />
          <QuickShare />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
