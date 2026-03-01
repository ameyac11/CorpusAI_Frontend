import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useOutletContext } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";

// Lazy-loaded page components — each gets its own JS chunk
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Chat = lazy(() => import("./pages/Chat"));
const Documents = lazy(() => import("./pages/Documents"));
const History = lazy(() => import("./pages/History"));
const CreativeSpace = lazy(() => import("./pages/CreativeSpace"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Wrapper to pass outlet context to Chat
function ChatWrapper() {
  const context = useOutletContext<{ docsSidebarOpen: boolean; setDocsSidebarOpen: (open: boolean) => void; onDocViewerChange?: (open: boolean) => void }>();
  return <Chat docsSidebarOpen={context?.docsSidebarOpen ?? false} setDocsSidebarOpen={context?.setDocsSidebarOpen ?? (() => { })} onDocViewerChange={context?.onDocViewerChange} />;
}

// Show loading screen only while auth state is being resolved
const AppWithLoading = () => {
  const { isLoading } = useAuth();

  return (
    <>
      <LoadingScreen show={isLoading} />
      {!isLoading && (
        <Suspense fallback={<LoadingScreen show={true} />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route element={<AppLayout />}>
              <Route path="/chat" element={<ChatWrapper />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/history" element={<History />} />
              <Route path="/creative-space" element={<CreativeSpace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
};

// provider order matters: Auth must wrap Chat since ChatProvider reads auth state
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppWithLoading />
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
