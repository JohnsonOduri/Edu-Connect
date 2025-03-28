
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { database } from "@/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";

interface StudentQuizViewProps {
  courseId: string;
}

export const StudentQuizView: React.FC<StudentQuizViewProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        
        const quizzesRef = query(
          ref(database, 'quizzes'),
          orderByChild('course_id'),
          equalTo(courseId)
        );
        
        const quizzesSnapshot = await get(quizzesRef);
        const quizzesData: any[] = [];
        
        if (quizzesSnapshot.exists()) {
          quizzesSnapshot.forEach((childSnapshot) => {
            quizzesData.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          
          // Check for attempts
          if (user?.id) {
            const updatedQuizzes = await Promise.all(
              quizzesData.map(async (quiz) => {
                const attemptRef = query(
                  ref(database, 'quizAttempts'),
                  orderByChild('quiz_id'),
                  equalTo(quiz.id)
                );
                
                const attemptSnapshot = await get(attemptRef);
                let hasAttempted = false;
                let score = null;
                
                if (attemptSnapshot.exists()) {
                  attemptSnapshot.forEach((childSnapshot) => {
                    const attempt = childSnapshot.val();
                    if (attempt.student_id === user.id) {
                      hasAttempted = true;
                      score = attempt.score;
                    }
                  });
                }
                
                return { ...quiz, hasAttempted, score };
              })
            );
            
            setQuizzes(updatedQuizzes);
          } else {
            setQuizzes(quizzesData);
          }
        } else {
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error("Failed to load quizzes");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [courseId, user?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
            Back to Quizzes
          </Button>
          <h3 className="text-lg font-semibold">{selectedQuiz.title}</h3>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedQuiz.title}</CardTitle>
              {selectedQuiz.hasAttempted ? (
                <Badge className="bg-green-500">Completed</Badge>
              ) : (
                <Badge>Not Attempted</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{selectedQuiz.description}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Time Limit: {selectedQuiz.time_limit || 'No time limit'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Questions: {selectedQuiz.questions?.length || 0}</span>
              </div>
              
              {selectedQuiz.hasAttempted && selectedQuiz.score !== null && (
                <div className="bg-muted p-4 rounded-md mt-2">
                  <h4 className="font-medium">Your Score</h4>
                  <p className="text-lg font-bold">{selectedQuiz.score}%</p>
                </div>
              )}
            </div>
            
            {!selectedQuiz.hasAttempted && (
              <div className="pt-4">
                <Button className="w-full">
                  Start Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Available Quizzes</h3>
      
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Quizzes Available</h3>
            <p className="mt-2 text-muted-foreground">
              There are no quizzes assigned to this course yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedQuiz(quiz)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  {quiz.hasAttempted ? (
                    <Badge className="bg-green-500">Completed</Badge>
                  ) : (
                    <Badge>Not Attempted</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">{quiz.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">Questions: {quiz.questions?.length || 0}</span>
                    {quiz.due_date ? (
                      <Badge variant="outline">Due: {new Date(quiz.due_date).toLocaleDateString()}</Badge>
                    ) : (
                      <Badge variant="outline">No due date</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
