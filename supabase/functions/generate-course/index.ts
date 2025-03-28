
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Base64 } from "https://deno.land/x/bb64/mod.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }

  try {
    const { syllabus, durationDays, title } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    if (!syllabus || !title) {
      throw new Error('Syllabus and title are required');
    }

    // Prepare the prompt for Gemini API to generate cleaner content without markdown
    const prompt = `
    Generate a detailed learning resource about "${title}" that spans ${durationDays} days.
    Based on this syllabus: ${syllabus}

    For each day (module), include:
    1. A descriptive title
    2. A short description
    3. 2 topics per module
    
    For each topic include:
    1. A title
    2. Detailed theory explanation (at least 400 words with proper formatting but NO markdown or special formatting - just plain text with paragraphs)
    3. 3 practice questions with answers
    4. 3 learning resources (mix of YouTube videos, websites, and articles)
    
    IMPORTANT: Do not use markdown syntax, special formatting, bold, italic, or any other special characters. Use only plain text with paragraphs.
    
    Format as JSON following this exact structure:
    {
      "modules": [
        {
          "title": "Module title",
          "description": "Module description",
          "topics": [
            {
              "title": "Topic title",
              "theory": "Detailed theory explanation in plain text with paragraphs",
              "practiceQuestions": [
                {"question": "Question text?", "answer": "Answer text"},
                ...
              ],
              "resources": [
                {"type": "youtube|website|article", "title": "Resource title", "url": "URL", "description": "Short description"},
                ...
              ]
            },
            ...
          ]
        },
        ...
      ]
    }`;

    console.log("Sending prompt to Gemini API:", { title, durationDays });
    
    // Make request to Gemini API
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        key: geminiApiKey
      }),
    });

    const aiResponse = await geminiResponse.json();
    
    if (aiResponse.error) {
      throw new Error(`Gemini API error: ${aiResponse.error.message}`);
    }
    
    // Check if we got a valid response
    if (!aiResponse.candidates || !aiResponse.candidates[0] || !aiResponse.candidates[0].content || !aiResponse.candidates[0].content.parts || !aiResponse.candidates[0].content.parts[0]) {
      throw new Error("Invalid response from Gemini API");
    }
    
    const generatedText = aiResponse.candidates[0].content.parts[0].text;
    
    // Find the JSON part from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : generatedText;
    
    try {
      const parsedContent = JSON.parse(jsonContent);
      
      // Generate PDF content for each topic without markdown formatting
      const topicPdfContents = [];
      
      parsedContent.modules.forEach((module, moduleIndex) => {
        module.topics.forEach((topic, topicIndex) => {
          // Create plain text content for PDF in a more structured format
          const pdfContent = `
${module.title} - ${topic.title}
Day ${moduleIndex + 1}, Topic ${topicIndex + 1}

${topic.theory}

Practice Questions:
${topic.practiceQuestions.map((q, i) => `
Question ${i+1}: 
${q.question}

Answer: ${q.answer}
`).join('\n')}

Learning Resources:
${topic.resources.map((r, i) => `
Resource ${i+1}: ${r.title}
Type: ${r.type}
URL: ${r.url}
Description: ${r.description}
`).join('\n')}
          `;
          
          // Add topic content to array with metadata
          topicPdfContents.push({
            id: crypto.randomUUID(),
            moduleId: module.id || crypto.randomUUID(),
            moduleTitle: module.title,
            moduleDay: moduleIndex + 1,
            topicTitle: topic.title,
            pdfContent: pdfContent,
            // Encode content in Base64 for transport
            contentBase64: Base64.fromString(pdfContent).toString(),
          });
        });
      });
      
      // Add missing fields for the course structure
      const fullCourse = {
        id: crypto.randomUUID(),
        title,
        description: `An AI-generated course about ${title} based on the provided syllabus.`,
        syllabus,
        durationDays,
        modules: parsedContent.modules.map((module, index) => ({
          ...module,
          id: crypto.randomUUID(),
          day: index + 1,
          topics: module.topics.map(topic => ({
            ...topic,
            id: crypto.randomUUID(),
            practiceQuestions: topic.practiceQuestions.map(q => ({
              ...q,
              id: crypto.randomUUID()
            })),
            resources: topic.resources.map(r => ({
              ...r,
              id: crypto.randomUUID()
            }))
          }))
        })),
        topicPdfs: topicPdfContents,
        createdAt: new Date().toISOString()
      };
      
      // Log the successful generation
      console.log('Successfully generated course with PDFs for:', title);

      return new Response(
        JSON.stringify(fullCourse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("JSON parsing error:", error.message);
      console.error("Raw text received:", generatedText);
      throw new Error(`Failed to parse JSON from API response: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in generate-course:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
