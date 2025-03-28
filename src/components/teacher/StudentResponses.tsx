
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { database } from "@/firebase";
import { ref, onValue, update, query, orderByChild, equalTo } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Check, MessageSquare, Filter, Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentResponsesProps {
  courseId?: string;
}

export const StudentResponses: React.FC<StudentResponsesProps> = ({ courseId }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !courseId) return;

    // Get assignments for this course
    const assignmentsRef = query(
      ref(database, 'assignments'),
      orderByChild('course_id'),
      equalTo(courseId)
    );
    
    const unsubscribe = onValue(assignmentsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Get assignment IDs for this course
      const assignmentIds: string[] = [];
      snapshot.forEach((childSnapshot) => {
        assignmentIds.push(childSnapshot.key!);
      });
      
      if (assignmentIds.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Now fetch submissions for these assignments
      const submissionsRef = ref(database, 'submissions');
      onValue(submissionsRef, (submissionsSnapshot) => {
        if (!submissionsSnapshot.exists()) {
          setSubmissions([]);
          setLoading(false);
          return;
        }
        
        const submissionsArray: any[] = [];
        submissionsSnapshot.forEach((childSnapshot) => {
          const submission = {
            id: childSnapshot.key,
            ...childSnapshot.val()
          };
          
          // Check if this submission is for one of our assignments
          if (assignmentIds.includes(submission.assignment_id)) {
            submissionsArray.push(submission);
          }
        });
        
        // Sort submissions by date (newest first)
        submissionsArray.sort((a, b) => 
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        );
        
        setSubmissions(submissionsArray);
        setLoading(false);
        
        if (submissionsArray.length > 0) {
          toast.info(`${submissionsArray.length} student submissions found`);
        }
      });
    });
    
    return () => unsubscribe();
  }, [user, courseId]);

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    
    setIsGrading(true);
    
    try {
      const gradeValue = parseInt(grade);
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > selectedSubmission.points) {
        toast.error(`Please enter a valid grade between 0 and ${selectedSubmission.points}`);
        setIsGrading(false);
        return;
      }
      
      const submissionRef = ref(database, `submissions/${selectedSubmission.id}`);
      await update(submissionRef, {
        grade: gradeValue,
        feedback,
        graded_at: new Date().toISOString(),
        graded_by: user?.id
      });
      
      toast.success("Submission graded successfully");
      setDialogOpen(false);
      
      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === selectedSubmission.id 
            ? {...sub, grade: gradeValue, feedback} 
            : sub
        )
      );
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission");
    } finally {
      setIsGrading(false);
    }
  };

  const openGradingDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || "");
    setGrade(submission.grade?.toString() || "");
    setAiSuggestion("");
    setDialogOpen(true);
  };

  const generateAiFeedback = async () => {
    if (!selectedSubmission) return;

    setIsGeneratingAiSuggestion(true);

    try {
      // Using the Gemini API already set up in the app
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAHHuOkjP9NRWAYUKoKcnuZCoT-oSlK42s",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an educational AI assistant. Based on the following student submission, provide helpful, constructive feedback in plain text (100-200 words). Avoid bold text or formatting. Suggest a good grade out of ${selectedSubmission.points} points. Focus on strengths and areas for improvement.

Assignment: ${selectedSubmission.assignment_title}
Student Submission: ${selectedSubmission.content}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate AI feedback");
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const suggestion = data.candidates[0].content.parts[0].text;
        setAiSuggestion(suggestion);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error generating AI feedback:", error);
      toast.error("Failed to generate AI feedback");
    } finally {
      setIsGeneratingAiSuggestion(false);
    }
  };

  const useSuggestion = () => {
    if (!aiSuggestion) return;
    
    // Try to extract grade from AI suggestion
    const gradeMatch = aiSuggestion.match(/\b(\d+)\/\s*(\d+)\b/);
    if (gradeMatch && gradeMatch[1] && selectedSubmission) {
      const suggestedGrade = parseInt(gradeMatch[1]);
      if (!isNaN(suggestedGrade) && suggestedGrade >= 0 && suggestedGrade <= selectedSubmission.points) {
        setGrade(suggestedGrade.toString());
      }
    }
    
    // Use the AI suggestion as feedback
    setFeedback(aiSuggestion);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Student Responses</h2>
          <p className="text-muted-foreground">Review and grade student assignment submissions</p>
        </div>
        
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter Responses
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No submissions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                When students submit their assignments, they will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{submission.assignment_title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted by: {submission.student_name} • {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={submission.grade !== undefined ? "secondary" : "outline"}>
                    {submission.grade !== undefined ? "Graded" : "Pending Review"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Student Response:</h4>
                    <p className="text-sm bg-muted p-3 rounded-md">{submission.content}</p>
                    
                    {submission.file_url && (
                      <div className="mt-2">
                        <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline">
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {submission.grade !== undefined ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Feedback:</h4>
                        <span className="text-sm font-medium">Grade: {submission.grade}/{submission.points}</span>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded-md">{submission.feedback || "No feedback provided."}</p>
                      <Button 
                        variant="outline" 
                        onClick={() => openGradingDialog(submission)}
                      >
                        Edit Grade
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => openGradingDialog(submission)} 
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Grade Submission
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <Tabs defaultValue="manual">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Grading</TabsTrigger>
                <TabsTrigger value="ai">AI-Assisted Grading</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Assignment:</h3>
                    <p className="text-sm mt-1">{selectedSubmission.assignment_title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Student Submission:</h3>
                    <div className="mt-1 p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{selectedSubmission.content}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Feedback:</h3>
                    <Textarea 
                      value={feedback} 
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      className="mt-1"
                      rows={5}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Grade (out of {selectedSubmission.points}):</h3>
                    <input 
                      type="number"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min="0"
                      max={selectedSubmission.points}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-md flex items-start gap-3">
                  <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">
                      AI can help you generate feedback and grade suggestions based on the student's submission.
                      The generated feedback can be edited before submitting.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Student Submission:</h3>
                  <div className="mt-1 p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{selectedSubmission.content}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={generateAiFeedback} 
                  variant="outline" 
                  disabled={isGeneratingAiSuggestion}
                  className="w-full"
                >
                  {isGeneratingAiSuggestion ? (
                    <>Generating AI Feedback...</>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Generate AI Feedback
                    </>
                  )}
                </Button>
                
                {aiSuggestion && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">AI Suggested Feedback:</h3>
                      <Button onClick={useSuggestion} variant="ghost" size="sm">Use Suggestion</Button>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{aiSuggestion}</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrade} disabled={isGrading}>
              {isGrading ? "Saving..." : "Save Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
