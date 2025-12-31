import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
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
import { AlphaCohortDetail } from "@/pages/AlphaCohortDetail";
import { AlphaWeekView } from "@/pages/AlphaWeekView";
import { MissionaryPathway } from "@/pages/MissionaryPathway";
import { JourneySession } from "@/pages/JourneySession";
import { VisionPage } from "@/pages/Vision";
import { WheelOfLife } from "@/pages/WheelOfLife";
import { VisionValues } from "@/pages/VisionValues";
import { VisionGoals } from "@/pages/VisionGoals";
import { VisionPlan } from "@/pages/VisionPlan";
import { VisionHabits } from "@/pages/VisionHabits";
import { VisionCheckin } from "@/pages/VisionCheckin";
import { TrackHub } from "@/pages/TrackHub";
import { WdepTool } from "@/pages/WdepTool";
import { StrengthsTool } from "@/pages/StrengthsTool";
import { StylesTool } from "@/pages/StylesTool";
import { EqTool } from "@/pages/EqTool";
import { ScaTool } from "@/pages/ScaTool";
import { DailyReflection } from "@/pages/DailyReflection";
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
      <Route path="/journey/:slug/week/:weekNumber" component={JourneySession} />
      <Route path="/alpha/:id" component={AlphaCohortDetail} />
      <Route path="/alpha/:cohortId/week/:weekNumber" component={AlphaWeekView} />
      <Route path="/pathway" component={MissionaryPathway} />
      <Route path="/vision" component={VisionPage} />
      <Route path="/vision/:sessionId/wheel" component={WheelOfLife} />
      <Route path="/vision/:sessionId/values" component={VisionValues} />
      <Route path="/vision/:sessionId/goals" component={VisionGoals} />
      <Route path="/vision/:sessionId/plan" component={VisionPlan} />
      <Route path="/vision/:sessionId/habits" component={VisionHabits} />
      <Route path="/vision/:sessionId/checkin" component={VisionCheckin} />
      <Route path="/growth" component={TrackHub} />
      <Route path="/vision/:sessionId/growth" component={TrackHub} />
      <Route path="/vision/:sessionId/tools/wdep" component={WdepTool} />
      <Route path="/vision/:sessionId/tools/strengths" component={StrengthsTool} />
      <Route path="/vision/:sessionId/tools/styles" component={StylesTool} />
      <Route path="/vision/:sessionId/tools/eq" component={EqTool} />
      <Route path="/vision/:sessionId/tools/sca" component={ScaTool} />
      <Route path="/reflection" component={DailyReflection} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
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
