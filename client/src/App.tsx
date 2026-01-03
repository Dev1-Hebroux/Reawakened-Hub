import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AiCoachDrawer } from "@/components/AiCoachDrawer";
import { OnboardingTour, useOnboardingTour } from "@/components/OnboardingTour";
import { useAuth } from "@/hooks/useAuth";
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
import { WdepExperiment } from "@/pages/WdepExperiment";
import { WdepPdf } from "@/pages/WdepPdf";
import { ScaPdf } from "@/pages/ScaPdf";
import { StrengthsTool } from "@/pages/StrengthsTool";
import { StylesTool } from "@/pages/StylesTool";
import { EqTool } from "@/pages/EqTool";
import { ScaTool } from "@/pages/ScaTool";
import { DailyReflection } from "@/pages/DailyReflection";
import { SessionBooking } from "@/pages/SessionBooking";
import { Mini360 } from "@/pages/Mini360";
import { FeedbackResponse } from "@/pages/FeedbackResponse";
import { CoachingLabs } from "@/pages/CoachingLabs";
import { GroupLabs } from "@/pages/GroupLabs";
import { PrayHub } from "@/pages/PrayHub";
import { CampusPrayer } from "@/pages/CampusPrayer";
import { MissionsHub } from "@/pages/MissionsHub";
import { GiveHub } from "@/pages/GiveHub";
import { MovementHub } from "@/pages/MovementHub";
import { MissionOnboarding } from "@/pages/MissionOnboarding";
import { DigitalActions } from "@/pages/DigitalActions";
import { MobileNav } from "@/components/layout/MobileNav";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Privacy from "@/pages/Privacy";
import { AdminDashboard } from "@/pages/Admin";
import { AdminEvents } from "@/pages/AdminEvents";
import { AdminSparks } from "@/pages/AdminSparks";
import { AdminBlog } from "@/pages/AdminBlog";
import { AdminUsers as AdminUsersLegacy } from "@/pages/AdminUsers";
import { AdminModeration } from "@/pages/AdminModeration";
import { AdminPrayer } from "@/pages/AdminPrayer";
import { AdminFunnels } from "@/pages/AdminFunnels";
import { AdminMissions } from "@/pages/AdminMissions";
import { AdminChallenges as AdminChallengesLegacy } from "@/pages/AdminChallenges";
import { AdminChallenges } from "@/pages/admin/Challenges";
import { AdminDashboard as NewAdminDashboard } from "@/pages/admin/Dashboard";
import { AdminUsers as NewAdminUsers } from "@/pages/admin/Users";
import { ContentSparks as AdminContentSparks } from "@/pages/admin/ContentSparks";
import { ContentBlog as AdminContentBlog } from "@/pages/admin/ContentBlog";
import { AdminCoaching } from "@/pages/admin/Coaching";
import { AdminMissionTrips } from "@/pages/admin/MissionTrips";
import { AdminVisionGoals } from "@/pages/admin/VisionGoals";
import { AnalyticsDashboard } from "@/pages/admin/Analytics";
import { Goals } from "@/pages/Goals";
import { ChallengesPage } from "@/pages/Challenges";
import { MissionTripsPublic } from "@/pages/MissionTripsPublic";
import { CoachingPublic } from "@/pages/CoachingPublic";
import { SchoolsLanding, UniversitiesLanding, EarlyCareerLanding, BuildersLanding, CouplesLanding } from "@/pages/AudienceLanding";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/community" component={CommunityHub} />
      <Route path="/sparks" component={SparksPage} />
      <Route path="/sparks/:id" component={SparksPage} />
      <Route path="/dominion/schools" component={SchoolsLanding} />
      <Route path="/dominion/universities" component={UniversitiesLanding} />
      <Route path="/dominion/9-5-reset" component={EarlyCareerLanding} />
      <Route path="/dominion/builders" component={BuildersLanding} />
      <Route path="/dominion/couples" component={CouplesLanding} />
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
      <Route path="/vision/:sessionId/wdep/:wdepId/experiment" component={WdepExperiment} />
      <Route path="/vision/:sessionId/wdep/:wdepId/pdf" component={WdepPdf} />
      <Route path="/vision/:sessionId/sca/:scaId/pdf" component={ScaPdf} />
      <Route path="/vision/:sessionId/tools/strengths" component={StrengthsTool} />
      <Route path="/vision/:sessionId/tools/styles" component={StylesTool} />
      <Route path="/vision/:sessionId/tools/eq" component={EqTool} />
      <Route path="/vision/:sessionId/tools/sca" component={ScaTool} />
      <Route path="/reflection" component={DailyReflection} />
      <Route path="/vision/:sessionId/tools/sessions" component={SessionBooking} />
      <Route path="/tools/sessions" component={SessionBooking} />
      <Route path="/vision/:sessionId/tools/360" component={Mini360} />
      <Route path="/tools/360" component={Mini360} />
      <Route path="/feedback/respond/:token" component={FeedbackResponse} />
      <Route path="/coaching" component={CoachingLabs} />
      <Route path="/vision/:sessionId/tools/coaching" component={CoachingLabs} />
      <Route path="/group-labs" component={GroupLabs} />
      <Route path="/vision/:sessionId/tools/group-labs" component={GroupLabs} />
      <Route path="/pray" component={PrayHub} />
      <Route path="/pray/campus/:id" component={CampusPrayer} />
      <Route path="/missions" component={MissionsHub} />
      <Route path="/missions/action/:type" component={DigitalActions} />
      <Route path="/mission/onboarding" component={MissionOnboarding} />
      <Route path="/give" component={GiveHub} />
      <Route path="/movement" component={MovementHub} />
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={NewAdminDashboard} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/sparks" component={AdminContentSparks} />
      <Route path="/admin/blog" component={AdminContentBlog} />
      <Route path="/admin/content/sparks" component={AdminContentSparks} />
      <Route path="/admin/content/blog" component={AdminContentBlog} />
      <Route path="/admin/users" component={NewAdminUsers} />
      <Route path="/admin/users/legacy" component={AdminUsersLegacy} />
      <Route path="/admin/moderation" component={AdminModeration} />
      <Route path="/admin/prayer" component={AdminPrayer} />
      <Route path="/admin/funnels" component={AdminFunnels} />
      <Route path="/admin/missions" component={AdminMissions} />
      <Route path="/admin/challenges" component={AdminChallenges} />
      <Route path="/admin/coaching" component={AdminCoaching} />
      <Route path="/admin/mission-trips" component={AdminMissionTrips} />
      <Route path="/admin/vision" component={AdminVisionGoals} />
      <Route path="/admin/analytics" component={AnalyticsDashboard} />
      <Route path="/challenges" component={ChallengesPage} />
      <Route path="/mission-trips" component={MissionTripsPublic} />
      <Route path="/coaching-public" component={CoachingPublic} />
      <Route path="/goals" component={Goals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useAuth() as { user: any; isAuthenticated: boolean };
  const { showTour, completeTour } = useOnboardingTour();

  return (
    <>
      <ScrollToTop />
      <div className="dove-background min-h-screen relative pb-20 xl:pb-0">
        <Toaster />
        <Router />
        <AiCoachDrawer />
      </div>
      <MobileNav />
      <PWAInstallBanner />
      {isAuthenticated && (
        <OnboardingTour 
          isOpen={showTour} 
          onComplete={completeTour}
          userName={user?.firstName}
        />
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
