import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge"; // Add Badge import
import {
  Bot,
  FileQuestion,
  CircleCheck,
  RotateCw,
  ArrowRight,
  BookOpen,
  RefreshCw,
  GraduationCap,
  Clock,
  AlertCircle,
  ListFilter
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { database } from "@/firebase";
import { ref, get, query, orderByChild, equalTo, push, set } from "firebase/database";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  teacher_id?: string;
  course_id?: string;
  course_name?: string;
  time_limit?: number;
  created_at?: string;
  due_date?: string;
  published?: boolean;
  completed?: boolean; // Add the missing property
  score?: number; // Add the missing property
}

export const QuizGenerator = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState("5");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuizMode, setCurrentQuizMode] = useState<"take" | "review">("take");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [teacherQuizzes, setTeacherQuizzes] = useState<Quiz[]>([]);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [quizFilter, setQuizFilter] = useState<'all' | 'assigned' | 'completed'>('all');

  // Gemini API Key
  const GEMINI_API_KEY = "AIzaSyC7lI04maXXCzhqWXAeMp5J9oqjllS0mXA"; // Replace with your Gemini API key
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  useEffect(() => {
    const fetchTeacherQuizzes = async () => {
      if (!user?.id) return;
      
      try {
        // Get enrolled courses
        const enrollmentsRef = query(
          ref(database, 'enrollments'),
          orderByChild('user_id'),
          equalTo(user.id)
        );
        
        const enrollmentsSnapshot = await get(enrollmentsRef);
        if (!enrollmentsSnapshot.exists()) return;
        
        // Get course IDs
        const courseIds: string[] = [];
        enrollmentsSnapshot.forEach((childSnapshot) => {
          const enrollment = childSnapshot.val();
          courseIds.push(enrollment.course_id);
        });
        
        // Fetch quizzes for these courses
        const quizzesRef = ref(database, 'quizzes');
        const quizzesSnapshot = await get(quizzesRef);
        
        if (!quizzesSnapshot.exists()) return;
        
        const quizzesArray: Quiz[] = [];
        
        quizzesSnapshot.forEach((childSnapshot) => {
          const quizData = childSnapshot.val();
          
          // Only include quizzes for courses the student is enrolled in and that are published
          if (courseIds.includes(quizData.course_id) && quizData.published === true) {
            quizzesArray.push({
              id: childSnapshot.key as string,
              title: quizData.title,
              topic: quizData.topic || quizData.title,
              difficulty: quizData.difficulty || 'medium',
              questions: quizData.questions || [],
              teacher_id: quizData.teacher_id,
              course_id: quizData.course_id,
              course_name: quizData.course_name || 'Unknown Course',
              time_limit: quizData.time_limit || 0,
              created_at: quizData.created_at,
              due_date: quizData.due_date,
              published: quizData.published
            });
          }
        });
        
        // Check for completions
        const completionsRef = query(
          ref(database, 'quiz_completions'),
          orderByChild('user_id'),
          equalTo(user.id)
        );
        
        const completionsSnapshot = await get(completionsRef);
        
        if (completionsSnapshot.exists()) {
          completionsSnapshot.forEach((childSnapshot) => {
            const completion = childSnapshot.val();
            
            // Find the quiz and mark it as completed
            const quizIndex = quizzesArray.findIndex(q => q.id === completion.quiz_id);
            if (quizIndex !== -1) {
              quizzesArray[quizIndex].completed = true;
              quizzesArray[quizIndex].score = completion.score;
            }
          });
        }
        
        setTeacherQuizzes(quizzesArray);
        if (quizzesArray.length > 0) {
          setActiveTab("assigned");
        }
        
      } catch (error) {
        console.error("Error fetching teacher quizzes:", error);
      }
    };
    
    fetchTeacherQuizzes();
  }, [user?.id]);

  useEffect(() => {
    // Clean up timer interval when component unmounts
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const parseQuizFromText = (text: string): Quiz | null => {
    try {
      const questions: QuizQuestion[] = [];
      const lines = text.split("\n");

      let i = 0;
      while (i < lines.length) {
        const line = lines[i].trim();

        // Look for the start of a question
        if (line.startsWith("Question:")) {
          const question = line.replace("Question:", "").trim();
          const options: string[] = [];

          // Collect the next 4 lines as options
          for (let j = 1; j <= 4; j++) {
            if (lines[i + j] && lines[i + j].trim().startsWith(`${j}.`)) {
              options.push(lines[i + j].replace(`${j}.`, "").trim());
            } else {
              console.error("Invalid option format:", lines[i + j]);
              return null; // Exit if options are not in the expected format
            }
          }

          // Look for the correct answer line
          const correctAnswerLine = lines[i + 5]?.trim();
          if (
            !correctAnswerLine ||
            !correctAnswerLine.startsWith("Correct Answer:")
          ) {
            console.error("Invalid correct answer format:", correctAnswerLine);
            return null; // Exit if the correct answer line is missing or invalid
          }

          const correctAnswer =
            parseInt(
              correctAnswerLine.replace("Correct Answer:", "").trim(),
              10
            ) - 1; // Convert to zero-based index

          if (isNaN(correctAnswer)) {
            console.error("Invalid correct answer value:", correctAnswerLine);
            return null; // Exit if the correct answer is not a number
          }

          // Look for the explanation line
          const explanationLine = lines[i + 6]?.trim();
          if (!explanationLine || !explanationLine.startsWith("Explanation:")) {
            console.error("Invalid explanation format:", explanationLine);
            return null; // Exit if the explanation line is missing or invalid
          }

          const explanation = explanationLine
            .replace("Explanation:", "")
            .trim();

          // Add the question to the list
          questions.push({
            question,
            options,
            correctAnswer,
            explanation,
          });

          i += 7; // Move to the next question
        } else {
          i++; // Skip lines that don't start with "Question:"
        }
      }

      if (questions.length > 0) {
        return {
          id: Date.now().toString(),
          title: "Generated Quiz",
          topic: "General",
          difficulty: "medium",
          questions,
        };
      }

      console.error("No valid questions found in the generated text.");
      return null;
    } catch (error) {
      console.error("Error parsing quiz text:", error);
      return null;
    }
  };

  const generateQuiz = async () => {
    if (!topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `Generate a ${difficulty} level quiz with ${numQuestions} questions on the topic of ${topic}. Each question should have 4 options, a correct answer, and an explanation. Return the response in the following format:

      Question: [Your question here]
      1. [Option 1]
      2. [Option 2]
      3. [Option 3]
      4. [Option 4]
      Correct Answer: [Correct option number]
      Explanation: [Explanation for why the correct answer is correct]`;

      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      console.log("Generated Text:", generatedText); // Debugging: Log generated text

      const quizData = parseQuizFromText(generatedText);
      console.log("Parsed Quiz Data:", quizData); // Debugging: Log parsed quiz data

      if (quizData && quizData.questions) {
        const newQuiz: Quiz = {
          id: Date.now().toString(),
          title: `${topic} Quiz`,
          topic,
          difficulty,
          questions: quizData.questions,
        };

        setQuiz(newQuiz);
        console.log("Quiz State Updated:", newQuiz); // Debugging: Log updated quiz state
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Array(quizData.questions.length).fill(-1));
        setQuizCompleted(false);
        setScore(0);
        setCurrentQuizMode("take");
        setActiveTab("take");

        toast.success("Quiz generated successfully!");
      } else {
        toast.error("Failed to generate quiz. Please try again.");
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      toast.error(error.message || "Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const startTeacherQuiz = (selectedQuiz: Quiz) => {
    setQuiz(selectedQuiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(selectedQuiz.questions.length).fill(-1));
    setQuizCompleted(false);
    setScore(0);
    setCurrentQuizMode("take");
    setActiveTab("take");
    
    // Set timer if time limit exists
    if (selectedQuiz.time_limit && selectedQuiz.time_limit > 0) {
      const timeInSeconds = selectedQuiz.time_limit * 60;
      setRemainingTime(timeInSeconds);
      
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime === null || prevTime <= 1) {
            clearInterval(interval);
            if (prevTime === 1) {
              calculateScore();
              toast.warning("Time's up! Your quiz has been automatically submitted.");
            }
            return null;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = async () => {
    if (!quiz) return;
    
    // Stop timer if active
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setRemainingTime(null);
    }

    let correctAnswers = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round(
      (correctAnswers / quiz.questions.length) * 100
    );
    setScore(finalScore);
    setQuizCompleted(true);
    setCurrentQuizMode("review");

    toast.success(`Quiz completed! Your score: ${finalScore}%`);
    
    // Save completion if it's a teacher quiz
    if (quiz.teacher_id && user?.id) {
      try {
        const completionRef = push(ref(database, 'quiz_completions'));
        
        await set(completionRef, {
          quiz_id: quiz.id,
          user_id: user.id,
          student_name: user.name,
          score: finalScore,
          completed_at: new Date().toISOString(),
          answers: selectedAnswers,
          teacher_id: quiz.teacher_id,
          course_id: quiz.course_id
        });
        
        // Update the quiz in the teacherQuizzes list
        setTeacherQuizzes(prev => 
          prev.map(q => 
            q.id === quiz.id 
              ? {...q, completed: true, score: finalScore} 
              : q
          )
        );
        
      } catch (error) {
        console.error("Error saving quiz completion:", error);
      }
    }
  };

  const resetQuiz = () => {
    if (!quiz) return;
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setQuizCompleted(false);
    setScore(0);
    setCurrentQuizMode("take");
  };

  const getFilteredQuizzes = () => {
    switch (quizFilter) {
      case 'assigned':
        return teacherQuizzes.filter(q => !q.completed);
      case 'completed':
        return teacherQuizzes.filter(q => q.completed);
      default:
        return teacherQuizzes;
    }
  };

  const isPastDue = (quiz: Quiz) => {
    if (!quiz.due_date) return false;
    const dueDate = new Date(quiz.due_date);
    return dueDate < new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Quiz Generator</h2>
        <p className="text-muted-foreground">
          Create and take quizzes on any topic
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="generate">
            <Bot className="h-4 w-4 mr-2" />
            Generate Quiz
          </TabsTrigger>
          <TabsTrigger value="assigned">
            <FileQuestion className="h-4 w-4 mr-2" />
            Assigned Quizzes {teacherQuizzes.length > 0 && `(${teacherQuizzes.length})`}
          </TabsTrigger>
          <TabsTrigger value="take" disabled={!quiz}>
            {remainingTime ? <Clock className="h-4 w-4 mr-2" /> : <FileQuestion className="h-4 w-4 mr-2" />}
            {remainingTime ? `Take Quiz (${formatTime(remainingTime)})` : 'Take Quiz'}
          </TabsTrigger>
        </TabsList>

        {/* Generate Quiz Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Quiz</CardTitle>
              <CardDescription>
                Create a custom quiz using AI based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="Enter a topic (e.g., JavaScript, React, Databases)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num-questions">Number of Questions</Label>
                  <Select value={numQuestions} onValueChange={setNumQuestions}>
                    <SelectTrigger id="num-questions">
                      <SelectValue placeholder="Select number of questions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={generateQuiz}
                className="w-full gap-2"
                disabled={isLoading || !topic}
              >
                {isLoading ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Assigned Quizzes Tab */}
        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Quizzes</CardTitle>
              <CardDescription>
                Quizzes assigned by your teachers
              </CardDescription>
              <div className="flex items-center space-x-2 mt-4">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
                <Select value={quizFilter} onValueChange={(value) => setQuizFilter(value as any)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter quizzes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quizzes</SelectItem>
                    <SelectItem value="assigned">Not Completed</SelectItem>
                    <SelectItem value="completed">Completed Quizzes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {teacherQuizzes.length === 0 ? (
                <div className="text-center py-8">
                  <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-xl font-medium mb-2">No Quizzes Available</h3>
                  <p className="text-muted-foreground">
                    You don't have any quizzes assigned to you yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredQuizzes().map((quiz) => (
                    <div 
                      key={quiz.id}
                      className={`border rounded-md p-4 ${
                        isPastDue(quiz) && !quiz.completed
                          ? 'border-red-300 bg-red-50 dark:bg-red-950/10'
                          : quiz.completed
                          ? 'border-green-300 bg-green-50 dark:bg-green-950/10'
                          : 'hover:bg-accent/50 cursor-pointer'
                      } transition-colors`}
                      onClick={() => {
                        if (!quiz.completed && !isPastDue(quiz)) {
                          startTeacherQuiz(quiz);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{quiz.title}</h3>
                        {quiz.completed ? (
                          <Badge className="bg-green-500">
                            Completed: {quiz.score}%
                          </Badge>
                        ) : isPastDue(quiz) ? (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Past Due
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {quiz.course_name} • {quiz.questions.length} questions
                      </p>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)} Difficulty
                        </span>
                        {quiz.time_limit ? (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Time Limit: {quiz.time_limit} min
                          </span>
                        ) : null}
                      </div>
                      
                      {quiz.due_date && (
                        <div className="mt-2 flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Due: {new Date(quiz.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Take Quiz Tab */}
        <TabsContent value="take">
          {quiz && quiz.questions && quiz.questions.length > 0 && (
            <Card className="relative">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>
                      {quiz.topic} •{" "}
                      {quiz.difficulty.charAt(0).toUpperCase() +
                        quiz.difficulty.slice(1)}{" "}
                      • {quiz.questions.length} questions
                    </CardDescription>
                  </div>
                  <Tabs
                    value={currentQuizMode}
                    onValueChange={(value) =>
                      setCurrentQuizMode(value as "take" | "review")
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="take" disabled={quizCompleted}>
                        Take
                      </TabsTrigger>
                      <TabsTrigger value="review">Review</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {remainingTime !== null && (
                  <div className="mt-2 flex items-center text-sm font-medium gap-2">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className={`${remainingTime < 60 ? 'text-red-500 animate-pulse' : ''}`}>
                      Time Remaining: {formatTime(remainingTime)}
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      Question {currentQuestionIndex + 1} of{" "}
                      {quiz.questions.length}
                    </span>
                    {quizCompleted && <span>Score: {score}%</span>}
                  </div>
                  <Progress
                    value={
                      ((currentQuestionIndex + 1) / quiz.questions.length) * 100
                    }
                  />
                </div>

                {/* Question */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {currentQuestionIndex + 1}.{" "}
                      {quiz.questions[currentQuestionIndex].question}
                    </h3>

                    <RadioGroup
                      value={
                        selectedAnswers[currentQuestionIndex]?.toString() || ""
                      }
                      onValueChange={(value) =>
                        handleAnswerSelect(parseInt(value))
                      }
                      disabled={currentQuizMode === "review"}
                    >
                      <div className="space-y-3">
                        {quiz.questions[currentQuestionIndex].options.map(
                          (option, index) => (
                            <div
                              key={index}
                              className={`flex items-start space-x-2 p-3 rounded-md border ${
                                currentQuizMode === "review"
                                  ? index ===
                                    quiz.questions[currentQuestionIndex]
                                      .correctAnswer
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                                    : selectedAnswers[currentQuestionIndex] ===
                                      index
                                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                    : "border-gray-200"
                                  : "border-gray-200"
                              }`}
                            >
                              <RadioGroupItem
                                value={index.toString()}
                                id={`option-${index}`}
                                disabled={currentQuizMode === "review"}
                              />
                              <Label
                                htmlFor={`option-${index}`}
                                className="flex-1 cursor-pointer"
                              >
                                {option}
                              </Label>
                              {currentQuizMode === "review" &&
                                index ===
                                  quiz.questions[currentQuestionIndex]
                                    .correctAnswer && (
                                  <CircleCheck className="h-5 w-5 text-green-500 ml-2" />
                                )}
                            </div>
                          )
                        )}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Explanation (only in review mode) */}
                  {currentQuizMode === "review" && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                        Explanation
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        {quiz.questions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuizMode === "review" && (
                    <Button variant="outline" onClick={resetQuiz}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                  )}

                  {!quizCompleted && currentQuizMode === "take" ? (
                    <Button
                      onClick={goToNextQuestion}
                      disabled={selectedAnswers[currentQuestionIndex] === -1}
                    >
                      {currentQuestionIndex === quiz.questions.length - 1
                        ? "Finish Quiz"
                        : "Next"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentQuizMode("review")}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Review Answers
                    </Button>
                  )}
                </div>
              </CardFooter>

              {/* Result overlay when completed */}
              {quizCompleted && currentQuizMode === "take" && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                  <GraduationCap className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                  <p className="text-4xl font-bold text-primary mb-6">
                    {score}%
                  </p>
                  <p className="text-muted-foreground mb-8 text-center">
                    You got {Math.round((score / 100) * quiz.questions.length)}{" "}
                    out of {quiz.questions.length} questions correct.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={resetQuiz}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                    <Button onClick={() => setCurrentQuizMode("review")}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Review Answers
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
