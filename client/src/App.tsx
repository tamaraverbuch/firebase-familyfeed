
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthProvider"; // Import the new provider
import NotFound from "@/pages/not-found";
import LoginScreen from "@/pages/LoginScreen";
import HomeScreen from "@/pages/HomeScreen";
import RecordScreen from "@/pages/RecordScreen";
import WriteScreen from "@/pages/WriteScreen";
import MyPageScreen from "@/pages/MyPageScreen";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-b-2 border-transparent"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="*" component={LoginScreen} />
      ) : (
        <>
          <Route path="/" component={() => (
            <AppLayout>
              <HomeScreen />
            </AppLayout>
          )} />
          <Route path="/record" component={() => (
            <AppLayout>
              <RecordScreen />
            </AppLayout>
          )} />
          <Route path="/write" component={() => (
            <AppLayout>
              <WriteScreen />
            </AppLayout>
          )} />
          <Route path="/my-page" component={() => (
            <AppLayout>
              <MyPageScreen />
            </AppLayout>
          )} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;