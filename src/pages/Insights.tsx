
import { ArrowLeft, TrendingUp, Heart, Activity, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Insights = () => {
  const navigate = useNavigate();

  const insights = [
    {
      icon: Heart,
      title: "Heart Health",
      value: "Good",
      trend: "+5%",
      description: "Your cardiovascular metrics are improving",
      color: "text-green-600"
    },
    {
      icon: Activity,
      title: "Activity Level",
      value: "Active",
      trend: "+12%",
      description: "You're meeting your daily activity goals",
      color: "text-blue-600"
    },
    {
      icon: Brain,
      title: "Mental Wellness",
      value: "Stable",
      trend: "0%",
      description: "Mood patterns are consistent",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Health Insights</h1>
      </div>

      {/* Overall Health Score */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#2ecac8]" />
            <span>Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#2ecac8] mb-2">8.2/10</div>
          <p className="text-gray-600">Your overall health is looking great! Keep up the good work.</p>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${insight.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{insight.value}</div>
                    <div className={`text-sm ${insight.trend.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>
                      {insight.trend}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Stay Hydrated</h4>
              <p className="text-sm text-blue-700">Aim for 8 glasses of water daily</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Regular Exercise</h4>
              <p className="text-sm text-green-700">Continue your current activity level</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Sleep Quality</h4>
              <p className="text-sm text-purple-700">Maintain 7-8 hours of sleep nightly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
