
import { Heart } from "lucide-react";
import { useHealthScore } from "@/hooks/useHealthMetrics";

const HealthScore = () => {
  const { data: healthScore, isLoading, error } = useHealthScore();

  console.log('HealthScore component:', { healthScore, isLoading, error });

  const getScoreMessage = (score: number) => {
    if (score >= 8) return "Excellent progress!";
    if (score >= 6) return "Great progress!";
    if (score >= 4) return "Good progress!";
    if (score >= 2) return "Keep it up!";
    return "Let's get started!";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "from-green-500 to-green-600";
    if (score >= 6) return "from-[#2ecac8] to-[#338886]";
    if (score >= 4) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  if (error) {
    console.error('HealthScore error:', error);
    // Show a default score instead of loading forever
    const score = 0;
    return (
      <div className={`bg-gradient-to-r ${getScoreColor(score)} rounded-2xl p-6 mb-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Health Score</h2>
            <p className="text-3xl font-bold">{score.toFixed(1)}</p>
            <p className="text-sm opacity-80">{getScoreMessage(score)}</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
            <Heart className="w-8 h-8" fill="white" />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl p-6 mb-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-16 h-16 rounded-full bg-gray-200"></div>
        </div>
      </div>
    );
  }

  const score = healthScore || 0;

  return (
    <div className={`bg-gradient-to-r ${getScoreColor(score)} rounded-2xl p-6 mb-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Health Score</h2>
          <p className="text-3xl font-bold">{score.toFixed(1)}</p>
          <p className="text-sm opacity-80">{getScoreMessage(score)}</p>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
          <Heart className="w-8 h-8" fill="white" />
        </div>
      </div>
    </div>
  );
};

export default HealthScore;
