
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Plus, Calendar, User, Settings, Activity, Smartphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hide navigation on auth pages and when user is not logged in
  const hideNavigationPaths = [
    "/welcome", 
    "/auth", 
    "/login", 
    "/register", 
    "/onboarding", 
    "/personal-info",
    "/new-user-onboarding"
  ];

  const shouldHideNavigation = hideNavigationPaths.includes(location.pathname) || !user;

  if (shouldHideNavigation) {
    return null;
  }

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Activity, path: "/symptoms", label: "Symptoms" },
    { icon: Plus, path: "/add", label: "Add" },
    { icon: Calendar, path: "/calendar", label: "Calendar" },
    { icon: Smartphone, path: "/devices", label: "Devices" },
    { icon: User, path: "/profile", label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ icon: Icon, path, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              location.pathname === path
                ? "text-[#2ecac8] bg-[#2ecac8]/10"
                : "text-gray-500 hover:text-[#2ecac8]"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
