
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Bot } from "lucide-react";
import { useForm } from "react-hook-form";
import { database } from "@/firebase";
import { ref, push, set, get } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AssignmentUploaderProps {
  courseId: string;
}

export const AssignmentUploader: React.FC<AssignmentUploaderProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiDialog, setAiDialog] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [aiAssignmentTitle, setAiAssignmentTitle] = useState("");
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      points: "10",
      assignmentType: "text",
      fileUrl: "",
      textContent: ""
    }
  });
  
  const onSubmit = async (data: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Get course details if not already fetched
      if (!courseDetails) {
        const courseSnapshot = await get(ref(database, `courses/${courseId}`));
        if (courseSnapshot.exists()) {
          setCourseDetails(courseSnapshot.val());
        }
      }
      
      const assignmentRef = push(ref(database, 'assignments'));
      
      await set(assignmentRef, {
        id: assignmentRef.key,
        title: data.title,
        description: data.description,
        due_date: data.dueDate || null,
        points: parseInt(data.points, 10),
        course_id: courseId,
        course_name: courseDetails?.title || "",
        teacher_id: user.id,
        created_at: new Date().toISOString(),
        assignmentType: data.assignmentType,
        textContent: data.textContent,
        file_url: data.fileUrl || null,
        isVisible: true // Ensures assignments are visible to students by default
      });
      
      toast.success("Assignment created successfully");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      reset();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for the AI");
      return;
    }
    
    setIsAiLoading(true);
    
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAHHuOkjP9NRWAYUKoKcnuZCoT-oSlK42s", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `As an education expert, create an assignment based on the following prompt: "${aiPrompt}". 
              
              Return the response in the following format:
              Title: [Assignment Title]
              
              Content:
              [The detailed assignment text with instructions, requirements, and any relevant information]` 
            }]
          }]
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate assignment with AI");
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Extract title from the generated text
        const titleMatch = generatedText.match(/Title:\s*(.+?)(?:\n|$)/);
        const title = titleMatch ? titleMatch[1].trim() : "AI Generated Assignment";
        
        // Extract content (everything after "Content:")
        const contentMatch = generatedText.match(/Content:\s*([\s\S]+)$/);
        const content = contentMatch ? contentMatch[1].trim() : generatedText;
        
        setAiGeneratedContent(content);
        setAiAssignmentTitle(title);
        setAiDialog(true);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error generating assignment with AI:", error);
      toast.error("Failed to generate assignment with AI");
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const useAiGenerated = () => {
    setValue("title", aiAssignmentTitle);
    // Update both description and textContent to include the AI-generated content
    setValue("description", aiGeneratedContent.substring(0, 200) + "..."); // Brief description is a truncated version
    setValue("textContent", aiGeneratedContent);
    setValue("assignmentType", "text");
    setAiDialog(false);
    toast.success("AI-generated content applied to form");
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Create Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual">
          <TabsList className="mb-4">
            <TabsTrigger value="manual">
              <FileText className="h-4 w-4 mr-2" />
              Manual Creation
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Bot className="h-4 w-4 mr-2" />
              AI-Assisted
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input 
                  id="title" 
                  {...register("title", { required: true })} 
                  placeholder="Enter assignment title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">Title is required</p>}
              </div>
              
              <div>
                <Label htmlFor="description">Brief Description</Label>
                <Textarea 
                  id="description" 
                  {...register("description", { required: true })} 
                  placeholder="Enter a brief description of this assignment"
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">Description is required</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    {...register("dueDate")} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input 
                    id="points" 
                    type="number" 
                    {...register("points", { required: true, min: 1 })} 
                    className={errors.points ? "border-red-500" : ""}
                  />
                  {errors.points && <p className="text-red-500 text-sm mt-1">Valid points are required</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="assignmentType">Assignment Type</Label>
                <Select 
                  onValueChange={(value) => setValue("assignmentType", value)} 
                  defaultValue="text"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Assignment</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                    <SelectItem value="code">Coding Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="textContent">Assignment Content</Label>
                <Textarea 
                  id="textContent" 
                  {...register("textContent")} 
                  placeholder="Enter the detailed content of the assignment"
                  rows={6}
                />
              </div>
              
              <div>
                <Label htmlFor="fileUrl">File URL (Optional)</Label>
                <Input 
                  id="fileUrl" 
                  {...register("fileUrl")} 
                  placeholder="Enter URL to assignment file or resource"
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create Assignment"}
              </Button>
              
              {showSuccessMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 mt-4">
                  <p className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload successful! Assignment is now available to students.
                  </p>
                </div>
              )}
            </form>
          </TabsContent>
          
          <TabsContent value="ai">
            <div className="space-y-4">
              <div className="p-4 bg-primary-foreground rounded-md text-sm">
                <p>Use AI to generate an assignment. Enter a topic or prompt and the AI will create assignment content for you.</p>
              </div>
              
              <div>
                <Label htmlFor="aiPrompt">AI Prompt</Label>
                <Textarea 
                  id="aiPrompt" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the assignment you want to create. For example: 'Create a programming assignment about arrays and loops for beginners'"
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleAiGenerate} 
                disabled={isAiLoading} 
                className="w-full"
              >
                {isAiLoading ? "Generating..." : "Generate Assignment"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <Dialog open={aiDialog} onOpenChange={setAiDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>AI-Generated Assignment</DialogTitle>
              <DialogDescription>
                Review the generated assignment content
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Title:</h3>
                <p className="mt-1">{aiAssignmentTitle}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Content:</h3>
                <div className="mt-1 p-4 bg-muted rounded-md max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{aiGeneratedContent}</pre>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAiDialog(false)}>
                Cancel
              </Button>
              <Button onClick={useAiGenerated}>
                Use This Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
