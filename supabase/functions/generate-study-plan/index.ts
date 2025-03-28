
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date } = await req.json();
    
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Make request to DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an AI study planning assistant. Create a study plan for a student for the date ${date}. 
            The plan should include courses and tasks. Return your response as JSON only with the following format:
            {
              "studyPlan": [
                {
                  "id": 1,
                  "title": "Course Name",
                  "tasks": [
                    {
                      "id": 1,
                      "title": "Task description",
                      "duration": 45,
                      "completed": false,
                      "time": "9:00 AM"
                    }
                  ]
                }
              ]
            }`
          },
          { role: 'user', content: `Create a study plan for ${date} focusing on computer science topics` }
        ],
        temperature: 0.7,
      }),
    });

    const aiResponse = await deepseekResponse.json();
    
    if (aiResponse.error) {
      throw new Error(`DeepSeek API error: ${aiResponse.error.message}`);
    }
    
    const studyPlan = JSON.parse(aiResponse.choices[0].message.content);
    
    // Log the successful generation
    console.log('Successfully generated study plan for:', date);

    return new Response(
      JSON.stringify(studyPlan),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-study-plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
