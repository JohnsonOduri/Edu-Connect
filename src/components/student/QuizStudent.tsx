
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { database } from '@/firebase';
import { ref, get, set } from 'firebase/database';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  due_date: string | null;
  questions: Question[];
  course_id: string;
  course_name: string;
  teacher_id: string;
  created_at: string;
  is_active: boolean;
  completed?: boolean;
  score?: number;
}

export const QuizStudent = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [attemptingQuiz, setAttemptingQuiz] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, [user?.id]);

  const fetchQuizzes = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const quizzesSnapshot = await get(ref(database, 'quizzes'));
      if (!quizzesSnapshot.exists()) {
        setQuizzes([]);
        setLoading(false);
        return;
      }

      const enrollmentsSnapshot = await get(ref(database, 'enrollments'));
      const enrolledCourseIds: string[] = [];

      if (enrollmentsSnapshot.exists()) {
        enrollmentsSnapshot.forEach((childSnapshot) => {
          const enrollment = childSnapshot.val();
          if (enrollment.user_id === user.id) {
            enrolledCourseIds.push(enrollment.course_id);
          }
        });
      }

      const attemptsSnapshot = await get(ref(database, 'quiz_attempts'));
      const completedQuizIds: Record<string, { score: number }> = {};
      
      if (attemptsSnapshot.exists()) {
        attemptsSnapshot.forEach((childSnapshot) => {
          const attempt = childSnapshot.val();
          if (attempt.user_id === user.id) {
            completedQuizIds[attempt.quiz_id] = { 
              score: attempt.score 
            };
          }
        });
      }

      const filteredQuizzes: Quiz[] = [];
      quizzesSnapshot.forEach((childSnapshot) => {
        const quiz = childSnapshot.val();
        if (enrolledCourseIds.includes(quiz.course_id) && quiz.is_active && quiz.published) {
          const quizId = childSnapshot.key || quiz.id;
          const isCompleted = completedQuizIds[quizId] !== undefined;
          
          filteredQuizzes.push({
            ...quiz,
            id: quizId,
            completed: isCompleted,
            score: isCompleted ? completedQuizIds[quizId].score : undefined
          });
        }
      });

      setQuizzes(filteredQuizzes);
      if (filteredQuizzes.length > 0) {
        toast.info(`${filteredQuizzes.length} quizzes available`);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setAttemptingQuiz(true);
    setCurrentAnswers(Array(quiz.questions.length).fill(-1));

    const timeLimit = quiz.time_limit * 60;
    setTimeRemaining(timeLimit);

    toast.info(`Quiz started! You have ${quiz.time_limit} minutes to complete it.`);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const submitQuiz = async () => {
    if (!selectedQuiz || !user?.id) return;

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    let correctCount = 0;
    selectedQuiz.questions.forEach((question, index) => {
      if (currentAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = (correctCount / selectedQuiz.questions.length) * 100;

    try {
      const attemptRef = ref(database, `quiz_attempts/attempt_${Date.now()}`);
      await set(attemptRef, {
        quiz_id: selectedQuiz.id,
        user_id: user.id,
        student_name: user.name,
        submitted_at: new Date().toISOString(),
        answers: currentAnswers,
        score: score,
        course_id: selectedQuiz.course_id
      });

      toast.success("Quiz submitted successfully");

      const updatedQuiz = {
        ...selectedQuiz,
        completed: true,
        score: score
      };

      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((q) => (q.id === selectedQuiz.id ? updatedQuiz : q))
      );

      setSelectedQuiz(updatedQuiz);
      setAttemptingQuiz(false);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setCurrentAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = optionIndex;
      return newAnswers;
    });
  };

  const getQuizStatusBadge = (quiz: Quiz) => {
    if (quiz.completed) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }

    const dueDate = quiz.due_date ? new Date(quiz.due_date) : null;
    if (dueDate && dueDate < new Date()) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-blue-500 text-blue-500">
        <Clock className="h-3 w-3 mr-1" />
        Available
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>Loading quizzes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p>No quizzes available for your courses.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedQuiz) {
    if (attemptingQuiz) {
      return (
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{selectedQuiz.title}</CardTitle>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className={timeRemaining < 60 ? "text-red-500 font-bold" : ""}>
                  Time remaining: {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{selectedQuiz.description}</p>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              {selectedQuiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="mb-8 pb-6 border-b last:border-0">
                  <h3 className="font-medium mb-4">Question {qIndex + 1}: {question.question}</h3>

                  <RadioGroup
                    value={currentAnswers[qIndex]?.toString() || ""}
                    onValueChange={(value) => handleAnswerSelect(qIndex, parseInt(value))}
                  >
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                        <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </ScrollArea>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              if (confirm("Are you sure you want to exit this quiz? Your progress will be lost.")) {
                if (timerInterval) clearInterval(timerInterval);
                setSelectedQuiz(null);
                setAttemptingQuiz(false);
              }
            }}>
              Exit Quiz
            </Button>
            <Button onClick={submitQuiz}>Submit Quiz</Button>
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{selectedQuiz.title}</CardTitle>
            <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
              Back to Quizzes
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {selectedQuiz.completed ? (
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center p-6 bg-muted rounded-lg">
                <Trophy className="h-12 w-12 text-yellow-500 mb-2" />
                <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                <p className="text-xl">Your Score: {selectedQuiz.score?.toFixed(0)}%</p>
                <p className="text-muted-foreground">
                  {selectedQuiz.score && selectedQuiz.score >= 70
                    ? "Great job! You've passed this quiz."
                    : "Keep practicing to improve your score."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Quiz Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Title:</span> {selectedQuiz.title}</p>
                  <p><span className="font-medium">Description:</span> {selectedQuiz.description}</p>
                  <p><span className="font-medium">Course:</span> {selectedQuiz.course_name}</p>
                  <p><span className="font-medium">Number of Questions:</span> {selectedQuiz.questions.length}</p>
                  <p><span className="font-medium">Time Limit:</span> {selectedQuiz.time_limit} minutes</p>
                  {selectedQuiz.due_date && (
                    <p><span className="font-medium">Due Date:</span> {new Date(selectedQuiz.due_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={() => startQuiz(selectedQuiz)}>
                  Start Quiz
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Quizzes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                {getQuizStatusBadge(quiz)}
              </div>
              <p className="text-sm text-muted-foreground">{quiz.course_name}</p>
            </CardHeader>

            <CardContent>
              <p className="text-sm mb-4 line-clamp-2">{quiz.description}</p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>{quiz.time_limit} minutes</span>
                <span className="mx-1">•</span>
                <span>{quiz.questions.length} questions</span>
              </div>

              {quiz.completed && (
                <div className="mb-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Score: {quiz.score?.toFixed(0)}%
                  </Badge>
                </div>
              )}

              <Button
                variant={quiz.completed ? "outline" : "default"}
                className="w-full"
                onClick={() => setSelectedQuiz(quiz)}
              >
                {quiz.completed ? "View Results" : "Take Quiz"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
