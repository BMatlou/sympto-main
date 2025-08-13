
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Apple, 
  Coffee, 
  UtensilsCrossed, 
  Heart, 
  XCircle, 
  Star 
} from 'lucide-react';

interface RecommendationsDisplayProps {
  symptom: string;
  severity: number;
  recommendations: {
    exercises: string[];
    foods: string[];
    beverages: string[];
    diet: string[];
    aidGuide: string[];
    avoidFoods: string[];
    lifestyle: string[];
  };
}

const RecommendationsDisplay: React.FC<RecommendationsDisplayProps> = ({ 
  symptom, 
  severity, 
  recommendations 
}) => {
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'exercises': return <Activity className="w-5 h-5" />;
      case 'foods': return <Apple className="w-5 h-5" />;
      case 'beverages': return <Coffee className="w-5 h-5" />;
      case 'diet': return <UtensilsCrossed className="w-5 h-5" />;
      case 'aidGuide': return <Heart className="w-5 h-5" />;
      case 'avoidFoods': return <XCircle className="w-5 h-5" />;
      case 'lifestyle': return <Star className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    const titles = {
      exercises: "Recommended Exercises",
      foods: "Beneficial Foods",
      beverages: "Helpful Beverages",
      diet: "Dietary Guidelines",
      aidGuide: "Self-Care Guide",
      avoidFoods: "Foods to Avoid",
      lifestyle: "Lifestyle Tips"
    };
    return titles[category as keyof typeof titles] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      exercises: "text-blue-600 bg-blue-50",
      foods: "text-green-600 bg-green-50",
      beverages: "text-cyan-600 bg-cyan-50",
      diet: "text-purple-600 bg-purple-50",
      aidGuide: "text-pink-600 bg-pink-50",
      avoidFoods: "text-red-600 bg-red-50",
      lifestyle: "text-orange-600 bg-orange-50"
    };
    return colors[category as keyof typeof colors] || "text-gray-600 bg-gray-50";
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recommendations for {symptom}
        </h2>
        <Badge variant={severity >= 7 ? "destructive" : severity >= 4 ? "secondary" : "default"}>
          Severity: {severity}/10
        </Badge>
      </div>

      <div className="grid gap-4">
        {Object.entries(recommendations).map(([category, items]) => (
          <Card key={category} className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center space-x-2 text-lg ${getCategoryColor(category)}`}>
                {getIconForCategory(category)}
                <span>{getCategoryTitle(category)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-800">
          <strong>Medical Disclaimer:</strong> These recommendations are for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment, especially for persistent or severe symptoms.
        </p>
      </div>
    </div>
  );
};

export default RecommendationsDisplay;
