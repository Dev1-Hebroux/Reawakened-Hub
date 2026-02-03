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
import { MobileNav } from "@/components/layout/MobileNav";
import { Navbar } from "@/components/layout/Navbar";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioPreloader } from "@/hooks/useAudioPreloader";
import { PWAProvider, InstallBanner, UpdateBanner, OfflineIndicator, IOSInstallInstructions } from "@/components/PWAComponents";
import { useNotifications } from "@/services/NotificationService";

import NotFound from "@/pages/not-found";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage, ResetPasswordPage } from "@/pages/auth/PasswordRecoveryPages";
import { Redirect } from "wouter";

// Lazy load all pages for better initial bundle size
const Home = lazy(() => import("@/pages/Home"));
const AboutPage = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPostPage = lazy(() => import("@/pages/BlogPost"));
const CommunityHub = lazy(() => import("@/pages/CommunityHub").then(m => ({ default: m.CommunityHub })));
const SparksPage = lazy(() => import("@/pages/Sparks").then(m => ({ default: m.SparksPage })));
const MissionPage = lazy(() => import("@/pages/Mission").then(m => ({ default: m.MissionPage })));
const OutreachPage = lazy(() => import("@/pages/Outreach").then(m => ({ default: m.OutreachPage })));
const PrayHub = lazy(() => import("@/pages/PrayHub").then(m => ({ default: m.PrayHub })));
const SchoolsLanding = lazy(() => import("@/pages/AudienceLanding").then(m => ({ default: m.SchoolsLanding })));
const UniversitiesLanding = lazy(() => import("@/pages/AudienceLanding").then(m => ({ default: m.UniversitiesLanding })));
const EarlyCareerLanding = lazy(() => import("@/pages/AudienceLanding").then(m => ({ default: m.EarlyCareerLanding })));
const BuildersLanding = lazy(() => import("@/pages/AudienceLanding").then(m => ({ default: m.BuildersLanding })));
const CouplesLanding = lazy(() => import("@/pages/AudienceLanding").then(m => ({ default: m.CouplesLanding })));

const JourneyLibrary = lazy(() => import("@/pages/JourneyLibrary").then(m => ({ default: m.JourneyLibrary })));
const JourneyDetail = lazy(() => import("@/pages/JourneyDetail").then(m => ({ default: m.JourneyDetail })));
const JourneyDayPage = lazy(() => import("@/pages/JourneyDay").then(m => ({ default: m.JourneyDayPage })));
const AlphaCohortDetail = lazy(() => import("@/pages/AlphaCohortDetail").then(m => ({ default: m.AlphaCohortDetail })));
const AlphaWeekView = lazy(() => import("@/pages/AlphaWeekView").then(m => ({ default: m.AlphaWeekView })));
const MissionaryPathway = lazy(() => import("@/pages/MissionaryPathway").then(m => ({ default: m.MissionaryPathway })));
const JourneySession = lazy(() => import("@/pages/JourneySession").then(m => ({ default: m.JourneySession })));
const VisionPage = lazy(() => import("@/pages/Vision").then(m => ({ default: m.VisionPage })));
const WheelOfLife = lazy(() => import("@/pages/WheelOfLife").then(m => ({ default: m.WheelOfLife })));
const VisionValues = lazy(() => import("@/pages/VisionValues").then(m => ({ default: m.VisionValues })));
const VisionGoals = lazy(() => import("@/pages/VisionGoals").then(m => ({ default: m.VisionGoals })));
const VisionPlan = lazy(() => import("@/pages/VisionPlan").then(m => ({ default: m.VisionPlan })));
const VisionHabits = lazy(() => import("@/pages/VisionHabits").then(m => ({ default: m.VisionHabits })));
const VisionCheckin = lazy(() => import("@/pages/VisionCheckin").then(m => ({ default: m.VisionCheckin })));
const TrackHub = lazy(() => import("@/pages/TrackHub").then(m => ({ default: m.TrackHub })));
const WdepTool = lazy(() => import("@/pages/WdepTool").then(m => ({ default: m.WdepTool })));
const WdepExperiment = lazy(() => import("@/pages/WdepExperiment").then(m => ({ default: m.WdepExperiment })));
const WdepPdf = lazy(() => import("@/pages/WdepPdf").then(m => ({ default: m.WdepPdf })));
const ScaPdf = lazy(() => import("@/pages/ScaPdf").then(m => ({ default: m.ScaPdf })));
const StrengthsTool = lazy(() => import("@/pages/StrengthsTool").then(m => ({ default: m.StrengthsTool })));
const StylesTool = lazy(() => import("@/pages/StylesTool").then(m => ({ default: m.StylesTool })));
const EqTool = lazy(() => import("@/pages/EqTool").then(m => ({ default: m.EqTool })));
const ScaTool = lazy(() => import("@/pages/ScaTool").then(m => ({ default: m.ScaTool })));
const DailyReflection = lazy(() => import("@/pages/DailyReflection").then(m => ({ default: m.DailyReflection })));
const SparkDetail = lazy(() => import("@/pages/SparkDetail").then(m => ({ default: m.SparkDetail })));
const SessionBooking = lazy(() => import("@/pages/SessionBooking").then(m => ({ default: m.SessionBooking })));
const Mini360 = lazy(() => import("@/pages/Mini360").then(m => ({ default: m.Mini360 })));
const FeedbackResponse = lazy(() => import("@/pages/FeedbackResponse").then(m => ({ default: m.FeedbackResponse })));
const CoachingLabs = lazy(() => import("@/pages/CoachingLabs").then(m => ({ default: m.CoachingLabs })));
const GroupLabs = lazy(() => import("@/pages/GroupLabs").then(m => ({ default: m.GroupLabs })));
const CampusPrayer = lazy(() => import("@/pages/CampusPrayer").then(m => ({ default: m.CampusPrayer })));
const PrayerPods = lazy(() => import("@/pages/PrayerPods"));
const MissionsHub = lazy(() => import("@/pages/MissionsHub").then(m => ({ default: m.MissionsHub })));
const GiveHub = lazy(() => import("@/pages/GiveHub").then(m => ({ default: m.GiveHub })));
const MovementHub = lazy(() => import("@/pages/MovementHub").then(m => ({ default: m.MovementHub })));
const MissionOnboarding = lazy(() => import("@/pages/MissionOnboarding").then(m => ({ default: m.MissionOnboarding })));
const DigitalActions = lazy(() => import("@/pages/DigitalActions").then(m => ({ default: m.DigitalActions })));
const MissionProjectDetail = lazy(() => import("@/pages/MissionProjectDetail").then(m => ({ default: m.MissionProjectDetail })));
const Profile = lazy(() => import("@/pages/Profile"));
const MyActivity = lazy(() => import("@/pages/MyActivity"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Settings = lazy(() => import("@/pages/Settings"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Goals = lazy(() => import("@/pages/Goals").then(m => ({ default: m.Goals })));
const ChallengesPage = lazy(() => import("@/pages/Challenges").then(m => ({ default: m.ChallengesPage })));
const MissionTripsPublic = lazy(() => import("@/pages/MissionTripsPublic").then(m => ({ default: m.MissionTripsPublic })));
const CoachingPublic = lazy(() => import("@/pages/CoachingPublic").then(m => ({ default: m.CoachingPublic })));
const ReadingPlans = lazy(() => import("@/pages/ReadingPlans").then(m => ({ default: m.ReadingPlansPage })));
const ReadingPlanDetail = lazy(() => import("@/pages/ReadingPlanDetail").then(m => ({ default: m.ReadingPlanDetail })));
const PartnerVision = lazy(() => import("@/pages/PartnerVision").then(m => ({ default: m.PartnerVision })));
const UnsubscribePage = lazy(() => import("@/pages/Unsubscribe").then(m => ({ default: m.UnsubscribePage })));


const AdminDashboard = lazy(() => import("@/pages/Admin").then(m => ({ default: m.AdminDashboard })));
const AdminEvents = lazy(() => import("@/pages/AdminEvents").then(m => ({ default: m.AdminEvents })));
const AdminSparks = lazy(() => import("@/pages/AdminSparks").then(m => ({ default: m.AdminSparks })));
const AdminBlog = lazy(() => import("@/pages/AdminBlog").then(m => ({ default: m.AdminBlog })));
const AdminUsersLegacy = lazy(() => import("@/pages/AdminUsers").then(m => ({ default: m.AdminUsers })));
const AdminModeration = lazy(() => import("@/pages/AdminModeration").then(m => ({ default: m.AdminModeration })));
const AdminPrayer = lazy(() => import("@/pages/AdminPrayer").then(m => ({ default: m.AdminPrayer })));
const AdminFunnels = lazy(() => import("@/pages/AdminFunnels").then(m => ({ default: m.AdminFunnels })));
const AdminMissions = lazy(() => import("@/pages/AdminMissions").then(m => ({ default: m.AdminMissions })));
const AdminChallengesLegacy = lazy(() => import("@/pages/AdminChallenges").then(m => ({ default: m.AdminChallenges })));
const AdminChallenges = lazy(() => import("@/pages/admin/Challenges").then(m => ({ default: m.AdminChallenges })));
const NewAdminDashboard = lazy(() => import("@/pages/admin/Dashboard").then(m => ({ default: m.AdminDashboard })));
const NewAdminUsers = lazy(() => import("@/pages/admin/Users").then(m => ({ default: m.AdminUsers })));
const AdminContentSparks = lazy(() => import("@/pages/admin/ContentSparks").then(m => ({ default: m.ContentSparks })));
const AdminContentBlog = lazy(() => import("@/pages/admin/ContentBlog").then(m => ({ default: m.ContentBlog })));
const AdminCoaching = lazy(() => import("@/pages/admin/Coaching").then(m => ({ default: m.AdminCoaching })));
const AdminMissionTrips = lazy(() => import("@/pages/admin/MissionTrips").then(m => ({ default: m.AdminMissionTrips })));
const AdminVisionGoals = lazy(() => import("@/pages/admin/VisionGoals").then(m => ({ default: m.AdminVisionGoals })));
const AnalyticsDashboard = lazy(() => import("@/pages/admin/Analytics").then(m => ({ default: m.AnalyticsDashboard })));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FAF8F5] to-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#7C9A8E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#4A7C7C] text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(window.location.pathname);
    return <Redirect to={`/login?redirect=${returnUrl}`} />;
  }

  return <Component />;
}

function GuestRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={AboutPage} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/community" component={CommunityHub} />
        <Route path="/sparks" component={SparksPage} />
        <Route path="/sparks/:id" component={SparksPage} />
        <Route path="/spark/:id" component={SparkDetail} />
        <Route path="/dominion/schools" component={SchoolsLanding} />
        <Route path="/dominion/universities" component={UniversitiesLanding} />
        <Route path="/dominion/9-5-reset" component={EarlyCareerLanding} />
        <Route path="/dominion/builders" component={BuildersLanding} />
        <Route path="/dominion/couples" component={CouplesLanding} />
        <Route path="/outreach" component={OutreachPage} />
        {import.meta.env.DEV && <Route path="/mission" component={MissionPage} />}
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
        <Route path="/pray/pods" component={PrayerPods} />
        <Route path="/reading-plans" component={ReadingPlans} />
        <Route path="/reading-plans/:id" component={ReadingPlanDetail} />
        <Route path="/partner-vision" component={PartnerVision} />
        <Route path="/unsubscribe/:token" component={UnsubscribePage} />
        <Route path="/missions" component={MissionsHub} />
        <Route path="/missions/action/:type" component={DigitalActions} />
        <Route path="/missions/project/:id" component={MissionProjectDetail} />
        <Route path="/mission/onboarding" component={MissionOnboarding} />
        <Route path="/give" component={GiveHub} />
        <Route path="/movement" component={MovementHub} />
        <Route path="/profile" component={Profile} />
        <Route path="/activity" component={MyActivity} />
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
        <Route path="/login">
          <GuestRoute component={LoginPage} />
        </Route>
        <Route path="/register">
          <GuestRoute component={RegisterPage} />
        </Route>
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function NotificationInitializer() {
  useNotifications();
  return null;
}

function AppContent() {
  const { user, isAuthenticated } = useAuth() as { user: any; isAuthenticated: boolean };
  const { showTour, completeTour } = useOnboardingTour();

  return (
    <>
      <ScrollToTop />
      <AudioPreloader />
      {isAuthenticated && <NotificationInitializer />}
      <Navbar />
      <div className="dove-background min-h-screen relative pb-20 xl:pb-0">
        <Toaster />
        <Router />
        <AiCoachDrawer />
      </div>
      <MobileNav />
      <UpdateBanner />
      <InstallBanner delay={5000} requireEngagement={false} />
      <IOSInstallInstructions />
      <OfflineIndicator />
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
        <AuthProvider>
          <PWAProvider>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </PWAProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
