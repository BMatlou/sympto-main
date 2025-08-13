
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity as ActivityIcon, Target, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";

const Activity = () => {
  const navigate = useNavigate();

  const weeklySteps = [
    { day: 'Mon', steps: 8500 },
    { day: 'Tue', steps: 9200 },
    { day: 'Wed', steps: 7800 },
    { day: 'Thu', steps: 10100 },
    { day: 'Fri', steps: 8900 },
    { day: 'Sat', steps: 6200 },
    { day: 'Sun', steps: 7500 },
  ];

  const energyLevels = [
    { time: '6AM', energy: 6 },
    { time: '9AM', energy: 8 },
    { time: '12PM', energy: 7 },
    { time: '3PM', energy: 5 },
    { time: '6PM', energy: 7 },
    { time: '9PM', energy: 4 },
  ];

  const currentSteps = 8432;
  const stepGoal = 10000;
  const stepProgress = (currentSteps / stepGoal) * 100;

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
        <h1 className="text-2xl font-bold text-gray-900">Activity Tracking</h1>
      </div>

      {/* Today's Progress */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ActivityIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{currentSteps.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Steps</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">324</p>
            <p className="text-sm text-gray-600">Calories</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">45</p>
            <p className="text-sm text-gray-600">Minutes</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step Goal</span>
            <span className="text-sm text-gray-600">{Math.round(stepProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stepProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {stepGoal - currentSteps} steps to reach your goal
          </p>
        </div>
      </div>

      {/* Weekly Steps Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Steps</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySteps}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="steps" fill="#2ecac8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 text-center mt-2">
          Average: {Math.round(weeklySteps.reduce((sum, day) => sum + day.steps, 0) / weeklySteps.length).toLocaleString()} steps/day
        </p>
      </div>

      {/* Energy Levels */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Energy Levels Today</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={energyLevels}>
              <XAxis dataKey="time" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 text-center mt-2">
          Peak energy at 9 AM
        </p>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ActivityIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Morning Walk</p>
                <p className="text-sm text-gray-600">30 minutes</p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">2,500 steps</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ActivityIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Stairs Climbing</p>
                <p className="text-sm text-gray-600">5 minutes</p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">150 steps</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <ActivityIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gym Workout</p>
                <p className="text-sm text-gray-600">45 minutes</p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">1,200 steps</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gradient-to-r from-[#2ecac8] to-[#338886] rounded-xl p-4 text-white">
        <h3 className="text-lg font-semibold mb-3">Today's Achievement</h3>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🏆</div>
          <div>
            <p className="font-medium">Step Streak Master</p>
            <p className="text-sm opacity-80">5 days in a row reaching your step goal!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
