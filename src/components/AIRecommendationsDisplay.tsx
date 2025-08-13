import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Apple, 
  Coffee, 
  UtensilsCrossed, 
  Heart, 
  AlertCircle, 
  Star,
  FileText
} from 'lucide-react';

interface AIRecommendation {
  symptomDescription: string;
  associatedSymptoms: string[];
  recommendedFoods: string[];
  recommendedBeverages: string[];
  exercises: string[];
  dietPlan: string[];
  reliefTips: string[];
  generatedAt: string;
  symptom: string;
  severity: number;
}

interface AIRecommendationsDisplayProps {
  symptom: string;
  severity: number;
  recommendations: AIRecommendation;
}

const AIRecommendationsDisplay: React.FC<AIRecommendationsDisplayProps> = ({ 
  symptom, 
  severity, 
  recommendations 
}) => {
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'symptomDescription': return <FileText className="w-5 h-5" />;
      case 'associatedSymptoms': return <AlertCircle className="w-5 h-5" />;
      case 'exercises': return <Activity className="w-5 h-5" />;
      case 'recommendedFoods': return <Apple className="w-5 h-5" />;
      case 'recommendedBeverages': return <Coffee className="w-5 h-5" />;
      case 'dietPlan': return <UtensilsCrossed className="w-5 h-5" />;
      case 'reliefTips': return <Heart className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    const titles = {
      symptomDescription: "About This Symptom",
      associatedSymptoms: "Related Symptoms to Watch",
      exercises: "Recommended Exercises",
      recommendedFoods: "Beneficial Foods",
      recommendedBeverages: "Helpful Beverages",
      dietPlan: "Dietary Guidelines",
      reliefTips: "Relief & Self-Care Tips"
    };
    return titles[category as keyof typeof titles] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      symptomDescription: "text-indigo-600 bg-indigo-50",
      associatedSymptoms: "text-amber-600 bg-amber-50",
      exercises: "text-blue-600 bg-blue-50",
      recommendedFoods: "text-green-600 bg-green-50",
      recommendedBeverages: "text-cyan-600 bg-cyan-50",
      dietPlan: "text-purple-600 bg-purple-50",
      reliefTips: "text-pink-600 bg-pink-50"
    };
    return colors[category as keyof typeof colors] || "text-gray-600 bg-gray-50";
  };

  const renderContent = (category: string, content: string | string[]) => {
    if (typeof content === 'string') {
      return (
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-700">{content}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-2">
        {content.map((item, index) => (
          <div 
            key={index}
            className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-sm text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Recommendations for {symptom}
        </h2>
        <Badge variant={severity >= 7 ? "destructive" : severity >= 4 ? "secondary" : "default"}>
          Severity: {severity}/10
        </Badge>
        <p className="text-xs text-gray-500 mt-2">
          Generated on {new Date(recommendations.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4">
        {/* Symptom Description */}
        {recommendations.symptomDescription && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center space-x-2 text-lg ${getCategoryColor('symptomDescription')}`}>
                {getIconForCategory('symptomDescription')}
                <span>{getCategoryTitle('symptomDescription')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderContent('symptomDescription', recommendations.symptomDescription)}
            </CardContent>
          </Card>
        )}

        {/* Associated Symptoms */}
        {recommendations.associatedSymptoms?.length > 0 && (
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center space-x-2 text-lg ${getCategoryColor('associatedSymptoms')}`}>
                {getIconForCategory('associatedSymptoms')}
                <span>{getCategoryTitle('associatedSymptoms')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderContent('associatedSymptoms', recommendations.associatedSymptoms)}
            </CardContent>
          </Card>
        )}

        {/* Other categories */}
        {Object.entries({
          recommendedFoods: recommendations.recommendedFoods,
          recommendedBeverages: recommendations.recommendedBeverages,
          exercises: recommendations.exercises,
          dietPlan: recommendations.dietPlan,
          reliefTips: recommendations.reliefTips
        }).map(([category, items]) => (
          items && items.length > 0 && (
            <Card key={category} className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center space-x-2 text-lg ${getCategoryColor(category)}`}>
                  {getIconForCategory(category)}
                  <span>{getCategoryTitle(category)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderContent(category, items)}
              </CardContent>
            </Card>
          )
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-800">
          <strong>Medical Disclaimer:</strong> These AI-generated recommendations are for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for proper diagnosis and treatment, especially for persistent or severe symptoms.
        </p>
      </div>
    </div>
  );
};

export default AIRecommendationsDisplay;
