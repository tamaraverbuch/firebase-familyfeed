// client/src/pages/LoginScreen.tsx
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
// Fix: wouter uses useLocation instead of useNavigate
import { useLocation } from "wouter";

export default function LoginScreen() {
  const { signIn, isLoading, error } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  // Fix: Get navigate function from useLocation
  const [, navigate] = useLocation();

  // Handle sign in with error handling
  const handleSignIn = async () => {
    try {
      setLoginError(null);
      await signIn();
      // Navigate to home on successful login
      navigate("/");
    } catch (error) {
      // Capture and display user-friendly error messages
      setLoginError(
        error instanceof Error 
          ? error.message 
          : "Failed to sign in. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <img 
          src="https://images.unsplash.com/photo-1542628682-88321d2a4828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600" 
          alt="Family sharing moments together" 
          className="w-48 h-48 object-cover rounded-full mb-8 shadow-lg" 
          loading="eager" 
        />
        
        <h1 className="font-heading font-bold text-4xl text-primary mb-2 text-center">Family Feed</h1>
        <p className="text-neutral-500 mb-8 text-center">Stay connected with your loved ones</p>
        
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <p className="text-center mb-6">
              Share and stay updated with your family's moments in a private, secure space.
            </p>
          </CardContent>
          
          {/* Show error message if login fails */}
          {(loginError || error) && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {loginError || (error instanceof Error ? error.message : "Authentication error")}
            </div>
          )}
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              onClick={handleSignIn}
              disabled={isLoading}
              aria-label="Sign in with Google"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {/* Google logo */}
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  Sign in with Google
                </span>
              )}
            </Button>
            
            <p className="text-sm text-neutral-500 text-center">
              Secure authentication powered by Firebase
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}