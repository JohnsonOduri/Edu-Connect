
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Clock, Save, Check, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { database } from '@/firebase';
import { ref, push, set, get } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';

interface QuizGeneratorProps {
  courseId: string;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      description: "",
      timeLimit: "30",
      dueDate: "",
      questions: []
    }
  });
  
  // Get course details
  const fetchCourseDetails = async () => {
    if (!courseDetails) {
      try {
        const courseSnapshot = await get(ref(database, `courses/${courseId}`));
        if (courseSnapshot.exists()) {
          setCourseDetails(courseSnapshot.val());
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    }
  };
  
  // Generate quiz with AI
  const generateQuizWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for the AI");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      await fetchCourseDetails();
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAHHuOkjP9NRWAYUKoKcnuZCoT-oSlK42s", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `Create a quiz with the following specifications:
              
              Topic: ${aiPrompt}
              
              Format:
              - Generate a title for the quiz
              - Include a brief description
              - Create 10 multiple-choice questions, each with 4 options and the correct answer marked
              
              Return in JSON format:
              {
                "title": "Quiz Title",
                "description": "Quiz description",
                "questions": [
                  {
                    "question": "Question text?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": 0
                  }
                ]
              }` 
            }]
          }]
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = generatedText.match(/```json([\s\S]*?)```/) || 
                          generatedText.match(/{[\s\S]*}/) || 
                          null;
        
        if (jsonMatch) {
          try {
            // Parse the JSON content
            let jsonContent;
            if (jsonMatch[1]) {
              jsonContent = JSON.parse(jsonMatch[1].trim());
            } else {
              jsonContent = JSON.parse(jsonMatch[0]);
            }
            
            // Ensure we have exactly 10 questions
            if (jsonContent.questions && jsonContent.questions.length < 10) {
              // Duplicate questions if we have less than 10
              const originalQuestions = [...jsonContent.questions];
              while (jsonContent.questions.length < 10) {
                const idx = jsonContent.questions.length % originalQuestions.length;
                const duplicatedQuestion = {...originalQuestions[idx]};
                duplicatedQuestion.question = `Additional ${duplicatedQuestion.question}`;
                jsonContent.questions.push(duplicatedQuestion);
              }
            } else if (jsonContent.questions && jsonContent.questions.length > 10) {
              // Trim to 10 questions if we have more
              jsonContent.questions = jsonContent.questions.slice(0, 10);
            }
            
            setGeneratedQuiz(jsonContent);
            setValue("title", jsonContent.title);
            setValue("description", jsonContent.description);
            setValue("questions", jsonContent.questions);
            
            toast.success("Quiz generated successfully with 10 questions");
          } catch (error) {
            console.error("Error parsing JSON:", error);
            toast.error("Failed to parse the generated quiz");
          }
        } else {
          toast.error("The AI didn't return a properly formatted quiz");
        }
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save the quiz
  const onSubmit = async (data: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await fetchCourseDetails();
      
      const quizRef = push(ref(database, 'quizzes'));
      
      // Ensure the quiz has 10 questions
      if (!data.questions || data.questions.length !== 10) {
        toast.error("Quiz must have exactly 10 questions.");
        setIsSubmitting(false);
        return;
      }
  
      // Validate each question
      for (const question of data.questions) {
        if (!question.options || question.options.length !== 4) {
          toast.error("Each question must have exactly 4 options.");
          setIsSubmitting(false);
          return;
        }
        if (typeof question.correctAnswer !== "number" || question.correctAnswer < 0 || question.correctAnswer > 3) {
          toast.error("Each question must have a valid correct answer (0-3).");
          setIsSubmitting(false);
          return;
        }
      }
  
      await set(quizRef, {
        id: quizRef.key,
        title: data.title,
        description: data.description,
        time_limit: parseInt(data.timeLimit, 10),
        due_date: data.dueDate || null,
        questions: data.questions,
        course_id: courseId,
        course_name: courseDetails?.title || "",
        teacher_id: user.id,
        created_at: new Date().toISOString(),
        is_active: true,
        published: true // Mark the quiz as published
      });
      
      toast.success("Quiz created and published successfully. Students can now take this quiz.");
      reset();
      setGeneratedQuiz(null);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Quiz Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ai">
          <TabsList className="mb-4">
            <TabsTrigger value="ai">
              <Bot className="h-4 w-4 mr-2" />
              AI-Generated Quiz
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Save className="h-4 w-4 mr-2" />
              Edit & Save
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai">
            <div className="space-y-4">
              <div className="p-4 bg-primary-foreground rounded-md text-sm">
                <p>Generate a quiz using AI. Describe the topic and the AI will create multiple-choice questions for you.</p>
              </div>
              
              <div>
                <Label htmlFor="aiPrompt">AI Prompt</Label>
                <Textarea 
                  id="aiPrompt" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the quiz you want to create. For example: 'Create a quiz about the basic principles of object-oriented programming'"
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={generateQuizWithAI} 
                disabled={isGenerating} 
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Quiz"}
              </Button>
              
              {generatedQuiz && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">{generatedQuiz.title}</h3>
                  <p>{generatedQuiz.description}</p>
                  
                  <div className="space-y-6">
                    <h4 className="font-medium">Preview Questions:</h4>
                    <ScrollArea className="h-[300px] rounded-md border p-4">
                      {generatedQuiz.questions.map((q: any, i: number) => (
                        <div key={i} className="mb-6 pb-6 border-b last:border-0">
                          <p className="font-medium mb-2">Q{i+1}: {q.question}</p>
                          <div className="pl-4 space-y-1">
                            {q.options.map((opt: string, j: number) => (
                              <div key={j} className={`flex items-center ${j === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                <span className="w-6">{String.fromCharCode(65 + j)}.</span> 
                                <span>{opt} {j === q.correctAnswer && ' (Correct)'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Quiz will have a timer and be available to students after publishing</span>
                    </div>
                    <Button onClick={() => {
                      const saveTab = document.getElementById('save-tab');
                      if (saveTab) saveTab.click();
                    }}>
                      Continue to Save Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="manual" id="save-tab">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input 
                  id="title" 
                  {...register("title", { required: true })} 
                  placeholder="Enter quiz title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">Title is required</p>}
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  {...register("description", { required: true })} 
                  placeholder="Enter quiz description"
                  className={errors.description ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">Description is required</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeLimit" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Time Limit (minutes)
                  </Label>
                  <Input 
                    id="timeLimit" 
                    type="number" 
                    {...register("timeLimit", { required: true, min: 1 })} 
                    className={errors.timeLimit ? "border-red-500" : ""}
                  />
                  {errors.timeLimit && <p className="text-red-500 text-sm mt-1">Valid time limit is required</p>}
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    {...register("dueDate")} 
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Quiz is ready to publish ({generatedQuiz?.questions?.length || 0}/10 questions)</span>
                </div>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>Publishing...</>
                  ) : (
                    <>Publish Quiz</>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
