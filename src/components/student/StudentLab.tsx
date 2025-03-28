
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { database } from "@/firebase";
import { ref, get, query, orderByChild, equalTo, set } from "firebase/database";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Code, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { CodeEditor } from "./CodeEditor";

interface LabProblem {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  teacher_id: string;
  course_id: string;
  course_name: string;
  difficulty: string;
  language?: string;
  created_at: string;
  due_date?: string;
  points: number;
  submitted?: boolean;
  submission?: {
    id: string;
    content: string;
    submitted_at: string;
    grade?: number;
    feedback?: string;
  };
  start_code?: string;
}

export const StudentLab = () => {
  const { user } = useAuth();
  const [labProblems, setLabProblems] = useState<LabProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<LabProblem | null>(null);
  const [solution, setSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const fetchLabProblems = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const enrollmentsRef = query(
          ref(database, 'enrollments'),
          orderByChild('user_id'),
          equalTo(user.id)
        );

        const enrollmentsSnapshot = await get(enrollmentsRef);

        if (!enrollmentsSnapshot.exists()) {
          setIsLoading(false);
          return;
        }

        const courseIds: string[] = [];
        enrollmentsSnapshot.forEach((childSnapshot) => {
          courseIds.push(childSnapshot.val().course_id);
        });

        const problemsRef = ref(database, 'codingProblems');
        const problemsSnapshot = await get(problemsRef);

        if (!problemsSnapshot.exists()) {
          setIsLoading(false);
          return;
        }

        const problemsArray: LabProblem[] = [];
        problemsSnapshot.forEach((childSnapshot) => {
          const problem = childSnapshot.val();
          if (courseIds.includes(problem.course_id)) {
            problemsArray.push({
              id: childSnapshot.key as string,
              ...problem,
              submitted: false,
            });
          }
        });

        setLabProblems(problemsArray);
      } catch (error) {
        console.error("Error fetching lab problems:", error);
        toast.error("Failed to load coding lab problems");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabProblems();
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!selectedProblem || !solution.trim() || !user?.id) {
      toast.error("Please provide a solution before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionId = `submission_${Date.now()}`;
      const submissionRef = ref(database, `lab_submissions/${submissionId}`);

      const submissionData = {
        problem_id: selectedProblem.id,
        user_id: user.id,
        student_name: user.name,
        content: solution,
        submitted_at: new Date().toISOString(),
        teacher_id: selectedProblem.teacher_id,
        problem_title: selectedProblem.title,
        course_id: selectedProblem.course_id,
        course_name: selectedProblem.course_name,
        points: selectedProblem.points,
      };

      await set(submissionRef, submissionData);

      toast.success("Solution submitted successfully");
      setLabProblems((prev) =>
        prev.map((p) =>
          p.id === selectedProblem.id
            ? {
                ...p,
                submitted: true,
                submission: { id: submissionId, ...submissionData },
              }
            : p
        )
      );
      
      setShowEditor(false);
      
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSubmissions = async (problemId: string) => {
    try {
      const submissionsRef = query(
        ref(database, 'lab_submissions'),
        orderByChild('problem_id'),
        equalTo(problemId)
      );

      const submissionsSnapshot = await get(submissionsRef);

      if (!submissionsSnapshot.exists()) {
        return [];
      }

      const submissions: any[] = [];
      submissionsSnapshot.forEach((childSnapshot) => {
        submissions.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      return submissions;
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (labProblems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Code className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-xl font-medium mb-2">No Coding Problems Available</h3>
            <p className="text-muted-foreground">
              You don't have any coding problems assigned to you yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show code editor interface when user chooses to solve a problem
  if (showEditor && selectedProblem) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => {
            if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
              setShowEditor(false);
              setSolution("");
            }
          }}>
            Back to Problem
          </Button>
          <h2 className="text-xl font-bold">{selectedProblem.title}</h2>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !solution.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Solution
              </>
            )}
          </Button>
        </div>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Problem: {selectedProblem.title}</CardTitle>
            <CardDescription>{selectedProblem.difficulty} • {selectedProblem.points} points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description:</h3>
                <p className="whitespace-pre-wrap text-sm">{selectedProblem.description}</p>
              </div>
              {selectedProblem.instructions && (
                <div>
                  <h3 className="font-medium">Instructions:</h3>
                  <p className="whitespace-pre-wrap text-sm">{selectedProblem.instructions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h3 className="font-medium">Your Code:</h3>
          <Textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder={selectedProblem.start_code || "// Write your solution here"}
            className="min-h-[300px] font-mono"
          />
        </div>
      </div>
    );
  }

  if (selectedProblem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedProblem(null)}>
            Back to Problems
          </Button>
          <h3 className="text-lg font-semibold">{selectedProblem.title}</h3>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedProblem.title}</CardTitle>
              <div className={`px-2 py-1 rounded-full text-xs ${
                selectedProblem.difficulty === 'easy' ? 'bg-green-500 text-white' :
                selectedProblem.difficulty === 'hard' ? 'bg-red-500 text-white' :
                'bg-yellow-500 text-white'
              }`}>
                {selectedProblem.difficulty.charAt(0).toUpperCase() + selectedProblem.difficulty.slice(1)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedProblem.description}</p>
            </div>

            {selectedProblem.instructions && (
              <div>
                <h4 className="font-medium mb-2">Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedProblem.instructions}</p>
              </div>
            )}

            {selectedProblem.start_code && (
              <div>
                <h4 className="font-medium mb-2">Starter Code</h4>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                    {selectedProblem.start_code}
                  </pre>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button
                className="w-full"
                disabled={selectedProblem.submitted}
                onClick={() => {
                  if (selectedProblem.submitted) {
                    return;
                  }
                  setShowEditor(true);
                  setSolution(selectedProblem.start_code || "");
                }}
              >
                {selectedProblem.submitted ? "Already Submitted" : "Solve This Problem"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Coding Lab Problems</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labProblems.map((problem) => (
          <Card key={problem.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProblem(problem)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{problem.title}</CardTitle>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  problem.difficulty === 'easy' ? 'bg-green-500 text-white' :
                  problem.difficulty === 'hard' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Language: {problem.language?.toUpperCase() || "JS"}</span>
                {problem.submitted ? (
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200">Completed</div>
                ) : problem.due_date ? (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Due: {new Date(problem.due_date).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No due date</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
