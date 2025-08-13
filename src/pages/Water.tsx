
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Droplets, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodayWater, useAddWaterIntake, useWaterIntake } from "@/hooks/useWaterIntake";

const Water = () => {
  const navigate = useNavigate();
  const { data: todayWater = 0 } = useTodayWater();
  const { data: waterHistory = [] } = useWaterIntake();
  const addWaterMutation = useAddWaterIntake();
  
  const dailyGoal = 2500;
  const progress = Math.min(100, (todayWater / dailyGoal) * 100);

  const quickAmounts = [250, 500, 750];

  const addWater = (amount: number) => {
    addWaterMutation.mutate(amount);
  };

  const removeWater = (amount: number) => {
    addWaterMutation.mutate(-amount);
  };

  // Get today's entries for display
  const today = new Date().toDateString();
  const todayEntries = waterHistory.filter(entry => 
    new Date(entry.recorded_at || entry.created_at).toDateString() === today
  );

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Water Tracking</h1>
      </div>

      {/* Progress Circle */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border mb-6 text-center">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 144 144">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#3b82f6"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${progress * 3.77} 377`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-3xl font-bold text-gray-900">{todayWater}</span>
            <span className="text-sm text-gray-600">ml</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-900">
            {Math.round(progress)}% of daily goal
          </p>
          <p className="text-sm text-gray-600">
            {dailyGoal - todayWater > 0 
              ? `${dailyGoal - todayWater}ml remaining`
              : 'Goal achieved! 🎉'
            }
          </p>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => addWater(amount)}
              disabled={addWaterMutation.isPending}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center disabled:opacity-50"
            >
              <Droplets className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <span className="text-sm font-medium text-blue-900">+{amount}ml</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Amount</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => removeWater(100)}
            disabled={addWaterMutation.isPending}
            className="p-3 bg-red-50 rounded-full border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Minus className="w-5 h-5 text-red-600" />
          </button>
          
          <div className="flex-1 text-center">
            <span className="text-2xl font-bold text-gray-900">100ml</span>
          </div>
          
          <button
            onClick={() => addWater(100)}
            disabled={addWaterMutation.isPending}
            className="p-3 bg-green-50 rounded-full border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5 text-green-600" />
          </button>
        </div>
      </div>

      {/* Daily History */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Log</h3>
        <div className="space-y-3">
          {todayEntries.length > 0 ? (
            todayEntries.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-900">
                    {new Date(entry.recorded_at || entry.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">{entry.amount_ml}ml</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No water logged today yet</p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Hydration Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-800">Drink water upon waking to kickstart hydration</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-800">Set reminders every 2 hours to drink water</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-800">Increase intake during exercise or hot weather</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Water;
