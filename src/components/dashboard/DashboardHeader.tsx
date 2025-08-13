
import { useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning!</h1>
        <p className="text-gray-600">How are you feeling today?</p>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 rounded-full bg-white shadow-md"
        >
          <Settings className="w-6 h-6 text-gray-600" />
        </button>
        <button 
          onClick={signOut}
          className="p-2 rounded-full bg-white shadow-md"
        >
          <LogOut className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
