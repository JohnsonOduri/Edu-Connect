import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { database } from "@/firebase";
import { ref, get, query, orderByChild, equalTo, set } from "firebase/database";

interface StudentCodingLabViewProps {
  courseId: string;
}

export const StudentCodingLabView: React.FC<StudentCodingLabViewProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [codingProblems, setCodingProblems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);

  useEffect(() => {
    const fetchCodingProblems = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);

        // Query coding problems for the specific course
        const problemsRef = query(
          ref(database, 'codingProblems'),
          orderByChild('course_id'),
          equalTo(courseId)
        );

        const problemsSnapshot = await get(problemsRef);
        const problemsData: any[] = [];

        if (problemsSnapshot.exists()) {
          problemsSnapshot.forEach((childSnapshot) => {
            problemsData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            });
          });

          // Check if the student has submitted solutions for these problems
          if (user?.id) {
            const updatedProblems = await Promise.all(
              problemsData.map(async (problem) => {
                const submissionRef = query(
                  ref(database, 'lab_submissions'),
                  orderByChild('problem_id'),
                  equalTo(problem.id)
                );

                const submissionSnapshot = await get(submissionRef);
                let hasSubmitted = false;

                if (submissionSnapshot.exists()) {
                  submissionSnapshot.forEach((childSnapshot) => {
                    const submission = childSnapshot.val();
                    if (submission.user_id === user.id) {
                      hasSubmitted = true;
                    }
                  });
                }

                return { ...problem, hasSubmitted };
              })
            );

            setCodingProblems(updatedProblems);
          } else {
            setCodingProblems(problemsData);
          }
        } else {
          setCodingProblems([]);
        }
      } catch (error) {
        console.error("Error fetching coding problems:", error);
        toast.error("Failed to load coding problems");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodingProblems();
  }, [courseId, user?.id]);

  const handleSubmitSolution = async (solution: string) => {
    if (!selectedProblem || !solution.trim() || !user?.id) {
      toast.error("Please provide a solution before submitting");
      return;
    }

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
      };

      await set(submissionRef, submissionData);

      toast.success("Solution submitted successfully");
      setCodingProblems((prev) =>
        prev.map((p) =>
          p.id === selectedProblem.id
            ? { ...p, hasSubmitted: true }
            : p
        )
      );
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast.error("Failed to submit solution");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <Badge className={
                selectedProblem.difficulty === 'easy' ? 'bg-green-500' :
                selectedProblem.difficulty === 'hard' ? 'bg-red-500' :
                'bg-yellow-500'
              }>
                {selectedProblem.difficulty.charAt(0).toUpperCase() + selectedProblem.difficulty.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedProblem.description}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Instructions</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedProblem.instructions}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Starter Code</h4>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                  {selectedProblem.start_code}
                </pre>
              </div>
            </div>

            <div className="pt-4">
              <Button
                className="w-full"
                disabled={selectedProblem.hasSubmitted}
                onClick={() => {
                  // Navigate to a solution submission page or open a modal
                  console.log("Attempting problem:", selectedProblem.id);
                }}
              >
                {selectedProblem.hasSubmitted ? "Already Submitted" : "Solve This Problem"}
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
      
      {codingProblems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Code className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Coding Problems Available</h3>
            <p className="mt-2 text-muted-foreground">
              There are no coding problems assigned to this course yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {codingProblems.map((problem) => (
            <Card key={problem.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedProblem(problem)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{problem.title}</CardTitle>
                  <Badge className={
                    problem.difficulty === 'easy' ? 'bg-green-500' :
                    problem.difficulty === 'hard' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Language: {problem.language.toUpperCase()}</span>
                  {problem.hasSubmitted ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                  ) : problem.due_date ? (
                    <Badge variant="outline">Due: {new Date(problem.due_date).toLocaleDateString()}</Badge>
                  ) : (
                    <Badge variant="outline">No due date</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
