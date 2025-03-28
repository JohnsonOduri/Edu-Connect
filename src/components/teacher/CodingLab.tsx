import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { database } from '@/firebase';
import { ref, push, set, get, query, orderByChild, equalTo } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Code, FileCode } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CodingLabProps {
  courseId: string;
}

export const CodingLab: React.FC<CodingLabProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [codingProblems, setCodingProblems] = useState<any[]>([]);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDialog, setAiDialog] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');
  const [aiGeneratedTitle, setAiGeneratedTitle] = useState('');
  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    difficulty: 'medium',
    language: 'javascript',
    dueDate: '',
    startCode: '// Your starter code here'
  });
  
  useEffect(() => {
    fetchCodingProblems();
  }, [courseId]);
  
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
  
  const fetchCodingProblems = async () => {
    try {
      const problemsRef = query(
        ref(database, 'codingProblems'),
        orderByChild('course_id'),
        equalTo(courseId)
      );

      const problemsSnapshot = await get(problemsRef);
      console.log("Fetched problems snapshot:", problemsSnapshot.val());

      const problemsData: any[] = [];
      if (problemsSnapshot.exists()) {
        problemsSnapshot.forEach((childSnapshot) => {
          problemsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }

      setCodingProblems(problemsData);
      if (problemsData.length > 0) {
        toast.info(`${problemsData.length} coding problems found for this course`);
      }
    } catch (error) {
      console.error("Error fetching coding problems:", error);
      toast.error("Failed to load coding problems");
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              text: `As a programming instructor, create a coding problem based on the following prompt: "${aiPrompt}". 
              
              Format the response as follows:
              
              Title: [Problem title]
              
              Description: [Brief problem description]
              
              Instructions: [Detailed instructions for the student]
              
              Language: [Recommended programming language]
              
              Difficulty: [easy/medium/hard]
              
              Starter Code:
              \`\`\`
              [Starter code that students will begin with]
              \`\`\`
              
              Expected Output or Behavior:
              [What the solution should accomplish]` 
            }]
          }]
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate coding problem");
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        
        // Extract title
        const titleMatch = generatedText.match(/Title:\s*(.+?)(?:\n|$)/);
        const title = titleMatch ? titleMatch[1].trim() : "AI Generated Coding Problem";
        
        // Extract language
        const languageMatch = generatedText.match(/Language:\s*(.+?)(?:\n|$)/);
        const language = languageMatch ? languageMatch[1].trim().toLowerCase() : "javascript";
        
        // Extract difficulty
        const difficultyMatch = generatedText.match(/Difficulty:\s*(.+?)(?:\n|$)/);
        const difficulty = difficultyMatch ? difficultyMatch[1].trim().toLowerCase() : "medium";
        
        // Extract starter code
        const starterCodeMatch = generatedText.match(/```(?:\w*\n|\n)?([\s\S]*?)```/);
        const starterCode = starterCodeMatch ? starterCodeMatch[1].trim() : "// Your code here";
        
        // Extract the rest of the content
        const fullContent = generatedText.replace(/Title:.*|\n+Language:.*|\n+Difficulty:.*|\n+Starter Code:.*[\s\S]*?```(?:\w*\n|\n)?([\s\S]*?)```/g, '').trim();
        
        setAiGeneratedTitle(title);
        setAiGeneratedContent(fullContent);
        setFormData({
          ...formData,
          title,
          difficulty: difficulty as any,
          language: language as any,
          description: fullContent.split('Instructions:')[0].replace('Description:', '').trim(),
          instructions: fullContent.includes('Instructions:') ? 
            fullContent.split('Instructions:')[1].split('Expected Output')[0].trim() : 
            '',
          startCode: starterCode
        });
        
        setAiDialog(true);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error generating coding problem:", error);
      toast.error("Failed to generate coding problem");
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleCreateProblem = async () => {
    if (!user) return;

    if (!formData.title || !formData.description || !formData.instructions) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await fetchCourseDetails();

      const problemRef = push(ref(database, 'codingProblems'));

      await set(problemRef, {
        id: problemRef.key,
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        difficulty: formData.difficulty,
        language: formData.language,
        due_date: formData.dueDate || null,
        start_code: formData.startCode,
        course_id: courseId,
        course_name: courseDetails?.title || "",
        teacher_id: user.id,
        created_at: new Date().toISOString(),
      });

      toast.success("Coding problem created successfully");
      fetchCodingProblems();
      setActiveTab('view');
    } catch (error) {
      console.error("Error creating coding problem:", error);
      toast.error("Failed to create coding problem");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectProblem = async (problem: any) => {
    setSelectedProblem(problem);
    setIsSubmissionsLoading(true);

    try {
      const submissionsRef = query(
        ref(database, 'lab_submissions'),
        orderByChild('problem_id'),
        equalTo(problem.id)
      );

      const submissionsSnapshot = await get(submissionsRef);
      const submissionsData: any[] = [];

      if (submissionsSnapshot.exists()) {
        submissionsSnapshot.forEach((childSnapshot) => {
          submissionsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
      }

      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setIsSubmissionsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Coding Lab</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="create">
              <Code className="h-4 w-4 mr-2" />
              Create Problem
            </TabsTrigger>
            <TabsTrigger value="view">
              <FileCode className="h-4 w-4 mr-2" />
              Problems & Submissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleAiGenerate} disabled={isAiLoading || !aiPrompt}>
                  <Bot className="h-4 w-4 mr-2" />
                  {isAiLoading ? "Generating..." : "Generate with AI"}
                </Button>
                
                <div className="flex-1">
                  <Input 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter a prompt to generate a coding problem with AI" 
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Problem Title</Label>
                <Input 
                  id="title" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a title for the coding problem"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="language">Programming Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="csharp">C#</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input 
                    id="dueDate" 
                    name="dueDate"
                    type="date" 
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Problem Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the coding problem"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea 
                  id="instructions" 
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  placeholder="Provide detailed instructions for solving the problem"
                  rows={5}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="startCode">Starter Code</Label>
                <Textarea 
                  id="startCode" 
                  name="startCode"
                  value={formData.startCode}
                  onChange={handleInputChange}
                  placeholder="Provide starter code for students"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              
              <Button onClick={handleCreateProblem} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create Coding Problem"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="view">
            <div className="space-y-6">
              {codingProblems.length === 0 ? (
                <div className="text-center py-8">
                  <FileCode className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Coding Problems Yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    Create your first coding problem for students to solve.
                  </p>
                  <Button onClick={() => setActiveTab('create')} className="mt-4">
                    Create Problem
                  </Button>
                </div>
              ) : (
                <div>
                  {!selectedProblem ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Submissions</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {codingProblems.map((problem) => (
                          <TableRow key={problem.id}>
                            <TableCell className="font-medium">{problem.title}</TableCell>
                            <TableCell>{problem.language.toUpperCase()}</TableCell>
                            <TableCell>
                              <span className={
                                problem.difficulty === 'easy' ? 'text-green-600' : 
                                problem.difficulty === 'hard' ? 'text-red-600' : 
                                'text-amber-600'
                              }>
                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{problem.due_date ? new Date(problem.due_date).toLocaleDateString() : 'No due date'}</TableCell>
                            <TableCell>{problem.submission_count || 0}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" onClick={() => handleSelectProblem(problem)}>
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={() => setSelectedProblem(null)}>
                          Back to Problems
                        </Button>
                        <h3 className="text-xl font-bold">{selectedProblem.title}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Language:</span>
                          <p className="font-medium">{selectedProblem.language.toUpperCase()}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Difficulty:</span>
                          <p className={
                            `font-medium ${
                              selectedProblem.difficulty === 'easy' ? 'text-green-600' : 
                              selectedProblem.difficulty === 'hard' ? 'text-red-600' : 
                              'text-amber-600'
                            }`
                          }>
                            {selectedProblem.difficulty.charAt(0).toUpperCase() + selectedProblem.difficulty.slice(1)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Due Date:</span>
                          <p className="font-medium">
                            {selectedProblem.due_date ? new Date(selectedProblem.due_date).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Description:</h4>
                        <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                          {selectedProblem.description}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Instructions:</h4>
                        <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                          {selectedProblem.instructions}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Starter Code:</h4>
                        <div className="bg-muted p-4 rounded-md overflow-x-auto">
                          <pre className="font-mono text-sm">{selectedProblem.start_code}</pre>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Student Submissions:</h4>
                        
                        {isSubmissionsLoading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : submissions.length === 0 ? (
                          <div className="text-center py-8 bg-muted rounded-md">
                            <p className="text-muted-foreground">No submissions yet</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {submissions.map((submission) => (
                                <TableRow key={submission.id}>
                                  <TableCell className="font-medium">{submission.student_name}</TableCell>
                                  <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
                                  <TableCell>
                                    <span className={
                                      submission.status === 'graded' ? 'text-green-600' : 
                                      'text-amber-600'
                                    }>
                                      {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost">
                                      Review
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <Dialog open={aiDialog} onOpenChange={setAiDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>AI-Generated Coding Problem</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Title:</h3>
                <p className="mt-1">{aiGeneratedTitle}</p>
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
              <Button onClick={() => {
                setAiDialog(false);
                toast.success("AI-generated content applied to form");
              }}>
                Use This Problem
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
