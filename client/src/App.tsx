import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Welcome from "@/pages/Welcome";
import ProfileCreation from "@/pages/ProfileCreation";
import Feed from "@/pages/Feed";
import Matches from "@/pages/Matches";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show welcome page if not authenticated
  if (!user) {
    return <Welcome />;
  }

  // Show profile creation if profile is not complete
  if (!user.isProfileComplete) {
    return (
      <>
        <Navigation />
        <ProfileCreation />
      </>
    );
  }

  // Show main app with navigation
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={() => <Feed />} />
        <Route path="/feed" component={() => <Feed />} />
        <Route path="/matches" component={() => <Matches />} />
        <Route path="/chat/:matchId" component={(params) => <Chat />} />
        <Route path="/chat" component={() => <Matches />} />
        <Route path="/profile" component={() => <Profile />} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
