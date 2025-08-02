import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { Layout } from "./components/Layout";
import { HomeOptimized } from "./HomeOptimized";
import { Auth } from "./components/Auth";
import Dashboard from "./components/Dashboard";
import AuthTest from "./components/AuthTest";
import { Loading } from "./components/Loading";
import SupabaseErrorBoundary from "./components/SupabaseErrorBoundary";
import TermsAndConditions from "./components/TermsAndConditions";
import { WaitlistPage } from "./components/WaitlistPage";
import SessionTimeoutWarning from "./components/SessionTimeoutWarning";
import { supabase } from "./supabase";

// OAuth Callback Handler Component
function OAuthCallbackHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStep, setProcessingStep] = React.useState('Connecting...');

  useEffect(() => {
    // Prevent multiple processing and only run once
    if (isProcessing) return;
    
    const handleOAuthCallback = async () => {
      setIsProcessing(true);
      console.log("OAuthCallbackHandler: Processing OAuth callback...");
      console.log("OAuthCallbackHandler: Current URL:", window.location.href);
      
      // Check URL parameters for OAuth callback indicators
      const urlParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.substring(1));
      
      // Log all URL parameters for debugging
      console.log("OAuthCallbackHandler: URL params:", Object.fromEntries(urlParams));
      console.log("OAuthCallbackHandler: Hash params:", Object.fromEntries(hashParams));
      
      // Check for OAuth errors first
      const hasError = urlParams.has('error') || hashParams.has('error');
      const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
      const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
      
      if (hasError) {
        console.error("OAuthCallbackHandler: OAuth error detected:", {
          error: urlParams.get('error') || hashParams.get('error'),
          errorCode,
          errorDescription: decodeURIComponent(errorDescription || ''),
        });
        
        setIsProcessing(false);
        navigate("/auth?error=" + encodeURIComponent(errorDescription || 'Authentication failed'), { replace: true });
        return;
      }
      
      const hasOAuthParams = urlParams.has('access_token') || 
                             urlParams.has('code') || 
                             hashParams.has('access_token') ||
                             location.hash.includes('access_token') ||
                             location.pathname === '/auth/callback';

      if (hasOAuthParams) {
        console.log("OAuthCallbackHandler: OAuth callback detected, processing session...");
        setProcessingStep('Verifying credentials...');
        
        try {
          // Wait a bit for Supabase to fully process the OAuth callback
          console.log("OAuthCallbackHandler: Waiting for Supabase to process OAuth...");
          await new Promise(resolve => setTimeout(resolve, 800)); // Reduced from 1500ms to 800ms
          
          setProcessingStep('Creating your profile...');
          
          const { data: { session }, error } = await supabase.auth.getSession();
          console.log("OAuthCallbackHandler: Final session check:", { 
            hasSession: !!session, 
            userId: session?.user?.id,
            error: error?.message 
          });
          
          if (session?.user) {
            console.log("OAuthCallbackHandler: Session found, ensuring user exists in database...");
            setProcessingStep('Setting up your account...');
            
            // Try to create/ensure user exists in database
            try {
              const { createSignupUser } = await import('./services/database');
              const userResult = await createSignupUser(
                session.user.id,
                session.user.email,
                session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split('@')[0]
              );
              
              if (userResult.success) {
                console.log("OAuthCallbackHandler: User created/verified, redirecting to dashboard");
              } else {
                console.log("OAuthCallbackHandler: User creation had issues but continuing:", userResult.error);
              }
            } catch (createError) {
              console.error("OAuthCallbackHandler: User creation failed but continuing:", createError);
            }
            
            // Navigate to dashboard 
            setProcessingStep('Welcome to Offly!');
            console.log("OAuthCallbackHandler: Redirecting to dashboard...");
            // Small delay to show the welcome message
            await new Promise(resolve => setTimeout(resolve, 300));
            navigate("/dashboard", { replace: true });
            return;
          } else {
            console.log("OAuthCallbackHandler: No session found, redirecting to auth");
            navigate("/auth?error=Authentication failed", { replace: true });
            return;
          }
          
        } catch (err) {
          console.error("OAuthCallbackHandler: Error in OAuth processing:", err);
          navigate("/auth?error=OAuth processing failed", { replace: true });
          return;
        }
      } else if (user && !loading) {
        // If user is already authenticated and no OAuth params, redirect to dashboard
        console.log("OAuthCallbackHandler: User already authenticated, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
      
      setIsProcessing(false);
    };

    // Only run if we're not loading and haven't processed yet
    if (!loading && !isProcessing) {
      handleOAuthCallback();
    }
  }, [location.pathname, location.search, location.hash, user, loading, navigate, isProcessing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Animated OAuth Icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto">
            <div className="w-full h-full border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-80 animate-pulse"></div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Almost there!
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {processingStep}
        </p>

        {/* Progress Steps */}
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>

        {/* Subtle help text */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This usually takes just a moment
        </p>
      </div>
    </div>
  );
}

// Dashboard with OAuth fallback handling
function DashboardWithOAuthHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // If user is not authenticated and we're on dashboard, redirect to auth
    if (!user && !loading) {
      console.log("Dashboard: User not authenticated, redirecting to auth");
      navigate("/auth", { replace: true });
      return;
    }

    // Check if this dashboard access has OAuth parameters (fallback case)
    const urlParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const hasOAuthParams = urlParams.has('access_token') || 
                           urlParams.has('code') || 
                           hashParams.has('access_token') ||
                           location.hash.includes('access_token');

    if (hasOAuthParams) {
      console.log("Dashboard: OAuth callback detected on dashboard route, cleaning URL");
      // Just clean the URL without redirecting since we're already processing the auth
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate, user, loading]);
  
  // Show loading while auth is being processed
  if (loading) {
    return <Loading />;
  }
  
  // Render dashboard only if user is authenticated
  if (user) {
    return <Dashboard />;
  }
  
  // Fallback loading state
  return <Loading />;
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <SupabaseErrorBoundary>
      <ThemeProvider>
        <SessionTimeoutWarning />
        <Router>
          <Routes>
            {/* OAuth callback handler */}
            <Route path="/auth/callback" element={<OAuthCallbackHandler />} />
            
            {/* Routes with Navbar (using Layout) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomeOptimized />} />
            </Route>
            {/* Routes without Navbar (rendered directly) */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth-test" element={<AuthTest />} />
            <Route path="/dashboard" element={<DashboardWithOAuthHandler />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </SupabaseErrorBoundary>
  );
}

export default App;
