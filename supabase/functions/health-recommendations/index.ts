
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptom, severity, associatedSymptoms = [] } = await req.json();

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating recommendations for: ${symptom} (severity: ${severity})`);

    const prompt = `As a health and wellness expert, provide comprehensive recommendations for someone experiencing "${symptom}" with a severity level of ${severity}/10. ${associatedSymptoms.length > 0 ? `Associated symptoms include: ${associatedSymptoms.join(', ')}.` : ''}

Please provide structured recommendations in the following categories:

1. SYMPTOM DESCRIPTION: Brief medical explanation of the symptom
2. ASSOCIATED SYMPTOMS: Common related symptoms to watch for
3. RECOMMENDED FOODS: Specific foods that may help alleviate the symptom
4. RECOMMENDED BEVERAGES: Drinks that can provide relief or support recovery
5. EXERCISES/MOVEMENT TIPS: Safe physical activities or movements
6. DIET PLAN: General dietary guidelines and meal timing
7. RELIEF & AID TIPS: Immediate relief measures and self-care techniques

Format your response as JSON with the following structure:
{
  "symptomDescription": "string",
  "associatedSymptoms": ["array", "of", "strings"],
  "recommendedFoods": ["array", "of", "strings"],
  "recommendedBeverages": ["array", "of", "strings"],
  "exercises": ["array", "of", "strings"],
  "dietPlan": ["array", "of", "strings"],
  "reliefTips": ["array", "of", "strings"]
}

Adjust recommendations based on severity: higher severity should focus more on rest and gentle approaches, while lower severity can include more active interventions.

IMPORTANT: This is for informational purposes only and should not replace professional medical advice.`;

    console.log('Making request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a health and wellness expert providing evidence-based recommendations. Always remind users to consult healthcare professionals for serious conditions. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    console.log(`OpenAI API response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorData}`);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI configuration.');
      } else {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    let recommendations;

    try {
      const content = data.choices[0].message.content;
      console.log('Raw OpenAI content:', content);
      
      // Try to parse the JSON response
      recommendations = JSON.parse(content);
      console.log('Successfully parsed recommendations:', recommendations);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw content:', data.choices[0].message.content);
      
      // Fallback: create a structured response from the text
      const content = data.choices[0].message.content;
      recommendations = {
        symptomDescription: `Information about ${symptom}`,
        associatedSymptoms: ["Please consult a healthcare professional for comprehensive symptom analysis"],
        recommendedFoods: ["Maintain a balanced diet with plenty of fruits and vegetables"],
        recommendedBeverages: ["Stay hydrated with water", "Consider herbal teas"],
        exercises: ["Light stretching", "Gentle walking as tolerated"],
        dietPlan: ["Eat regular, balanced meals", "Avoid processed foods"],
        reliefTips: [content.substring(0, 200) + "..."] // Use partial content as fallback
      };
    }

    // Ensure all required fields are present
    const defaultRecommendations = {
      symptomDescription: `Information about ${symptom}`,
      associatedSymptoms: [],
      recommendedFoods: [],
      recommendedBeverages: [],
      exercises: [],
      dietPlan: [],
      reliefTips: []
    };

    const finalRecommendations = {
      ...defaultRecommendations,
      ...recommendations
    };

    console.log('Final recommendations prepared:', finalRecommendations);

    return new Response(JSON.stringify({
      success: true,
      recommendations: {
        ...finalRecommendations,
        generatedAt: new Date().toISOString(),
        symptom,
        severity
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in health-recommendations function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
