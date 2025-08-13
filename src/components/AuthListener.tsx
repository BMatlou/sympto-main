import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthListener = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isNewUser } = useAuth();

  useEffect(() => {
    console.log("🎯 AuthListener - State:", { 
      user: !!user, 
      loading, 
      isNewUser, 
      pathname: location.pathname 
    });

    if (loading) {
      console.log("⏳ Still loading auth state...");
      return;
    }

    // Handle signed out users - only redirect if they're on protected routes
    if (!user) {
      console.log("🚫 No user, checking if redirect needed");
      const publicRoutes = ["/welcome", "/auth", "/login", "/register"];
      if (!publicRoutes.includes(location.pathname)) {
        console.log("🚫 Redirecting to welcome from protected route");
        navigate("/welcome", { replace: true });
      }
      return;
    }

    // Handle signed in users
    if (user) {
      console.log("👤 User authenticated, checking profile completion");
      
      if (isNewUser) {
        console.log("🆕 New user, needs onboarding");
        const onboardingRoutes = ["/onboarding", "/new-user-onboarding"];
        if (!onboardingRoutes.includes(location.pathname)) {
          navigate("/new-user-onboarding", { replace: true });
        }
        return;
      } else {
        console.log("✅ Returning user with complete profile");
        const authRoutes = [
          "/welcome", "/auth", "/login", "/register", "/onboarding", "/new-user-onboarding"
        ];
        if (authRoutes.includes(location.pathname)) {
          navigate("/", { replace: true });
        }
        return;
      }
    }
  }, [user, loading, isNewUser, location.pathname, navigate]);

  return null;
};

export default AuthListener;
