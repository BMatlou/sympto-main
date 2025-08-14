import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthListener = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isNewUser } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Signed out: only redirect if NOT on a public route
    const publicRoutes = ["/welcome", "/auth", "/login", "/register"];
    if (!user) {
      if (!publicRoutes.includes(location.pathname)) {
        navigate("/welcome", { replace: true });
      }
      // Don't redirect if already on /welcome or another public route
      return;
    }

    // Signed in: onboarding or home logic
    if (user) {
      if (isNewUser) {
        const onboardingRoutes = ["/onboarding", "/new-user-onboarding"];
        if (!onboardingRoutes.includes(location.pathname)) {
          navigate("/new-user-onboarding", { replace: true });
        }
        return;
      } else {
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
