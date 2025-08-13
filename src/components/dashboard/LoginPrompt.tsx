
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const LoginPrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Heart className="w-16 h-16 text-[#2ecac8] mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to HealthTracker</h1>
        <p className="text-gray-600 mb-6">Track your health, manage medications, and stay on top of your wellness journey.</p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-[#2ecac8] hover:bg-[#338886] text-white px-8 py-3 rounded-lg font-medium"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;
