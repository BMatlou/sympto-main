
interface SymptomRecommendation {
  exercises: string[];
  foods: string[];
  beverages: string[];
  diet: string[];
  aidGuide: string[];
  avoidFoods: string[];
  lifestyle: string[];
}

export const getSymptomRecommendations = (symptom: string, severity: number): SymptomRecommendation => {
  const baseRecommendations: Record<string, SymptomRecommendation> = {
    "headache": {
      exercises: [
        "Gentle neck stretches",
        "Shoulder rolls",
        "Deep breathing exercises",
        "Light walking",
        "Progressive muscle relaxation",
        "Yoga (child's pose, cat-cow)",
        "Eye exercises"
      ],
      foods: [
        "Magnesium-rich foods (spinach, almonds)",
        "Omega-3 fatty fish (salmon, mackerel)",
        "Cherries (natural melatonin)",
        "Ginger (anti-inflammatory)",
        "Quinoa (complex carbs)",
        "Sweet potatoes",
        "Dark leafy greens"
      ],
      beverages: [
        "Water (stay hydrated)",
        "Herbal teas (peppermint, chamomile)",
        "Green tea (moderate caffeine)",
        "Ginger tea",
        "Coconut water",
        "Fresh fruit juices (low sugar)"
      ],
      diet: [
        "Regular meal timing",
        "Avoid skipping meals",
        "Limit processed foods",
        "Reduce refined sugar",
        "Eat anti-inflammatory foods",
        "Include magnesium and B vitamins"
      ],
      aidGuide: [
        "Apply cold compress to forehead",
        "Rest in dark, quiet room",
        "Maintain regular sleep schedule",
        "Practice stress management",
        "Keep a headache diary",
        "Consider essential oils (peppermint)"
      ],
      avoidFoods: [
        "Excessive caffeine",
        "Alcohol",
        "Processed meats",
        "Aged cheeses",
        "Artificial sweeteners",
        "MSG-containing foods"
      ],
      lifestyle: [
        "Maintain consistent sleep schedule",
        "Manage stress levels",
        "Stay hydrated",
        "Regular exercise routine",
        "Limit screen time"
      ]
    },
    "fatigue": {
      exercises: [
        "Light cardio (10-15 minutes)",
        "Gentle stretching",
        "Tai chi",
        "Short walks",
        "Breathing exercises",
        "Light yoga",
        "Resistance band exercises"
      ],
      foods: [
        "Iron-rich foods (lean meat, beans)",
        "Complex carbohydrates (oats, brown rice)",
        "B-vitamin rich foods (eggs, leafy greens)",
        "Nuts and seeds",
        "Citrus fruits (vitamin C)",
        "Whole grains",
        "Lean proteins"
      ],
      beverages: [
        "Water throughout the day",
        "Green tea",
        "Fresh vegetable juices",
        "Herbal teas (ginseng, rhodiola)",
        "Coconut water",
        "Smoothies with protein"
      ],
      diet: [
        "Eat smaller, frequent meals",
        "Balance proteins and carbs",
        "Include iron and B12",
        "Limit sugar crashes",
        "Focus on nutrient density"
      ],
      aidGuide: [
        "Prioritize 7-9 hours sleep",
        "Take short power naps (20 min)",
        "Create a sleep routine",
        "Check for underlying conditions",
        "Consider iron/B12 supplements",
        "Manage stress effectively"
      ],
      avoidFoods: [
        "High sugar snacks",
        "Excessive caffeine",
        "Heavy, fatty meals",
        "Alcohol",
        "Refined carbohydrates"
      ],
      lifestyle: [
        "Regular sleep schedule",
        "Gradual increase in activity",
        "Stress management",
        "Social connections",
        "Medical check-up if persistent"
      ]
    },
    "back pain": {
      exercises: [
        "Cat-cow stretches",
        "Knee-to-chest stretches",
        "Pelvic tilts",
        "Walking",
        "Swimming",
        "Core strengthening",
        "Hamstring stretches"
      ],
      foods: [
        "Anti-inflammatory foods",
        "Turmeric",
        "Fatty fish (omega-3)",
        "Leafy greens",
        "Berries",
        "Nuts and seeds",
        "Olive oil"
      ],
      beverages: [
        "Water for hydration",
        "Turmeric tea",
        "Green tea",
        "Tart cherry juice",
        "Herbal anti-inflammatory teas"
      ],
      diet: [
        "Anti-inflammatory diet",
        "Maintain healthy weight",
        "Include calcium and vitamin D",
        "Limit inflammatory foods"
      ],
      aidGuide: [
        "Apply heat/cold therapy",
        "Maintain good posture",
        "Use ergonomic furniture",
        "Sleep on supportive mattress",
        "Avoid prolonged sitting",
        "Gentle massage"
      ],
      avoidFoods: [
        "Processed foods",
        "Trans fats",
        "Excessive sugar",
        "Refined carbs",
        "Foods high in omega-6"
      ],
      lifestyle: [
        "Maintain proper posture",
        "Regular movement breaks",
        "Ergonomic workspace",
        "Weight management",
        "Stress reduction"
      ]
    },
    "nausea": {
      exercises: [
        "Deep breathing exercises",
        "Gentle walking",
        "Seated stretches",
        "Meditation",
        "Light yoga poses"
      ],
      foods: [
        "Ginger",
        "Plain crackers",
        "Bananas",
        "Rice",
        "Toast",
        "Applesauce",
        "Bland, easy-to-digest foods"
      ],
      beverages: [
        "Ginger tea",
        "Peppermint tea",
        "Clear broths",
        "Electrolyte drinks",
        "Small sips of water",
        "Chamomile tea"
      ],
      diet: [
        "Eat small, frequent meals",
        "Avoid strong odors",
        "Room temperature foods",
        "BRAT diet if severe"
      ],
      aidGuide: [
        "Fresh air",
        "Acupressure (P6 point)",
        "Rest with head elevated",
        "Avoid strong smells",
        "Stay hydrated"
      ],
      avoidFoods: [
        "Spicy foods",
        "Fatty or greasy foods",
        "Strong-smelling foods",
        "Dairy products",
        "Carbonated drinks"
      ],
      lifestyle: [
        "Avoid triggers",
        "Get fresh air",
        "Rest and relaxation",
        "Gradual return to normal diet"
      ]
    }
  };

  // Get recommendations for the specific symptom or use general recommendations
  const symptomLower = symptom.toLowerCase();
  let recommendations = baseRecommendations[symptomLower];

  // If exact match not found, try partial matches
  if (!recommendations) {
    for (const [key, value] of Object.entries(baseRecommendations)) {
      if (symptomLower.includes(key) || key.includes(symptomLower)) {
        recommendations = value;
        break;
      }
    }
  }

  // Default general recommendations if no match found
  if (!recommendations) {
    recommendations = {
      exercises: [
        "Light walking",
        "Gentle stretching",
        "Deep breathing exercises",
        "Meditation",
        "Rest as needed"
      ],
      foods: [
        "Whole foods",
        "Fruits and vegetables",
        "Lean proteins",
        "Complex carbohydrates",
        "Anti-inflammatory foods"
      ],
      beverages: [
        "Water",
        "Herbal teas",
        "Fresh juices",
        "Coconut water"
      ],
      diet: [
        "Balanced nutrition",
        "Regular meal times",
        "Adequate hydration",
        "Limit processed foods"
      ],
      aidGuide: [
        "Rest and recovery",
        "Monitor symptoms",
        "Consult healthcare provider if severe",
        "Manage stress",
        "Get adequate sleep"
      ],
      avoidFoods: [
        "Processed foods",
        "Excessive sugar",
        "Trans fats",
        "Alcohol"
      ],
      lifestyle: [
        "Regular sleep schedule",
        "Stress management",
        "Regular exercise",
        "Social support"
      ]
    };
  }

  // Adjust recommendations based on severity (1-10 scale)
  if (severity >= 8) {
    // High severity - focus on rest and gentle approaches
    recommendations.exercises = recommendations.exercises.filter(ex => 
      ex.includes('gentle') || ex.includes('breathing') || ex.includes('rest')
    );
    recommendations.aidGuide.unshift("Seek medical attention if symptoms persist or worsen");
  } else if (severity >= 5) {
    // Moderate severity - balanced approach
    recommendations.aidGuide.unshift("Monitor symptoms closely");
  }

  return recommendations;
};

export const formatRecommendationsForDisplay = (recommendations: SymptomRecommendation) => {
  return {
    "🏃‍♀️ Recommended Exercises": recommendations.exercises,
    "🥗 Beneficial Foods": recommendations.foods,
    "🥤 Helpful Beverages": recommendations.beverages,
    "🍽️ Dietary Guidelines": recommendations.diet,
    "🩺 Self-Care Guide": recommendations.aidGuide,
    "❌ Foods to Avoid": recommendations.avoidFoods,
    "🌟 Lifestyle Tips": recommendations.lifestyle
  };
};
