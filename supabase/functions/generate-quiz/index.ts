
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, difficulty, numQuestions } = await req.json();
    
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    if (!topic) {
      throw new Error('Topic is required');
    }

    const questionsCount = numQuestions || 5;

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
            content: `You are a quiz generator AI. Create a ${difficulty} difficulty quiz about ${topic} with ${questionsCount} questions. 
            The quiz should test the user's knowledge about ${topic}. 
            
            For each question:
            1. Write a clear, concise question
            2. Provide exactly 4 options, with one correct answer
            3. Indicate which option is correct (0-based index)
            4. Provide a brief explanation of why the answer is correct
            
            Return ONLY JSON in the following format:
            {
              "questions": [
                {
                  "question": "Question text here?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": 0,
                  "explanation": "Explanation of why Option A is correct"
                }
              ]
            }`
          },
          { 
            role: 'user', 
            content: `Generate a ${difficulty} difficulty quiz about ${topic} with ${questionsCount} questions.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    const aiResponse = await deepseekResponse.json();
    
    if (aiResponse.error) {
      throw new Error(`DeepSeek API error: ${aiResponse.error.message}`);
    }
    
    const quizData = JSON.parse(aiResponse.choices[0].message.content);
    
    // Validate the response format
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid response format from AI');
    }

    // Log the successful generation
    console.log('Successfully generated quiz for topic:', topic);

    return new Response(
      JSON.stringify(quizData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-quiz:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
