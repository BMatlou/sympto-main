import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useUserProfile } from "@/hooks/useSupabaseData";
import HealthScore from "@/components/dashboard/HealthScore";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import HealthInsights from "@/components/dashboard/HealthInsights";
import BiometricLockPrompt from "@/components/BiometricLockPrompt";
import QuickActions from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  console.log('Index render:', {
    user: !!user,
    userProfile: !!userProfile,
    authLoading,
    profileLoading,
    isVerified
  });

  // Show loading while auth or profile is loading
  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2ecac8]/10 via-white to-[#338886]/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ecac8] mx-auto mb-4"></div>
          <p className="text-gray-600 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Check biometric lock
  const biometricEnabled = localStorage.getItem('biometricLockEnabled') === 'true';
  
  if (biometricEnabled && !isVerified) {
    return (
      <BiometricLockPrompt 
        onVerified={() => {
          console.log('Biometric verification successful');
          setIsVerified(true);
        }}
      />
    );
  }

  // Render dashboard
  console.log('Rendering dashboard for user:', userProfile?.full_name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2ecac8]/10 via-white to-[#338886]/5">
      <div className="max-w-md mx-auto p-4 pb-32 space-y-6">
        {/* Header */}
        <div className="pt-2 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hello, {userProfile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">How are you feeling today?</p>
        </div>

        {/* Health Score */}
        <HealthScore />

        {/* Quick Actions */}
        <QuickActions />

        {/* Metrics Grid */}
        <MetricsGrid />

        {/* Health Insights */}
        <HealthInsights />

        {/* Health Report Button */}
        <div className="pt-4">
          <Button
            onClick={() => navigate('/report-landing')}
            className="bg-gradient-to-r from-[#2ecac8] to-[#338886] hover:from-[#338886] hover:to-[#2ecac8] text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Health Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
