import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen,
  Check,
  Plus,
  RotateCw,
  FileText,
  Trash2,
  Bot
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { db } from "../../firebase.js"; // Adjust the import path
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";

interface StudyPlanTask {
  id: string;
  title: string;
  course: string;
  time: string;
  duration: number;
  completed: boolean;
  user_id: string;
  created_at: string;
}

interface CourseGroup {
  title: string;
  tasks: StudyPlanTask[];
}

export const StudyPlanner = () => {
  const { user, isAuthenticated } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studyPlanData, setStudyPlanData] = useState<CourseGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch study plan data from Firestore
  const fetchStudyPlan = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "study_plans"),
          where("user_id", "==", user.id) // Change from user.uid to user.id
        )
      );

      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyPlanTask[];

      // Group tasks by course
      const groupedData = tasks.reduce<CourseGroup[]>((acc, task) => {
        const course = acc.find(c => c.title === task.course);
        if (course) {
          course.tasks.push(task);
        } else {
          acc.push({ title: task.course, tasks: [task] });
        }
        return acc;
      }, []);

      setStudyPlanData(groupedData);
    } catch (error) {
      console.error("Error fetching study plan:", error);
      toast.error("Failed to fetch study plan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyPlan();
  }, [isAuthenticated, user]);

  // Add a new task to Firestore
  const addTask = async (formData: { title: string; course: string; time: string; duration: string }) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to add a task");
      return;
    }

    try {
      const { title, course, time, duration } = formData;
      const newTask = {
        user_id: user.id, // Change from user.uid to user.id
        course,
        title,
        duration: parseInt(duration),
        time,
        completed: false,
        created_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "study_plans"), newTask);
      toast.success("Task added successfully!");

      // Update local state
      setStudyPlanData(prevData => {
        const courseIndex = prevData.findIndex(c => c.title === course);
        if (courseIndex !== -1) {
          const updatedCourse = {
            ...prevData[courseIndex],
            tasks: [...prevData[courseIndex].tasks, { id: docRef.id, ...newTask }]
          };
          return [...prevData.slice(0, courseIndex), updatedCourse, ...prevData.slice(courseIndex + 1)];
        } else {
          return [...prevData, { title: course, tasks: [{ id: docRef.id, ...newTask }] }];
        }
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  // Add the missing toggleTaskCompletion function
  const toggleTaskCompletion = async (courseId: string, taskId: string) => {
    try {
      const courseIndex = studyPlanData.findIndex(c => c.title === courseId);
      if (courseIndex === -1) return;
      
      const taskIndex = studyPlanData[courseIndex].tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      const task = studyPlanData[courseIndex].tasks[taskIndex];
      const newCompletedStatus = !task.completed;
      
      // Update in Firestore
      await updateDoc(doc(db, "study_plans", taskId), {
        completed: newCompletedStatus
      });
      
      // Update local state
      setStudyPlanData(prevData => {
        const newData = [...prevData];
        newData[courseIndex] = {
          ...newData[courseIndex],
          tasks: [
            ...newData[courseIndex].tasks.slice(0, taskIndex),
            { ...task, completed: newCompletedStatus },
            ...newData[courseIndex].tasks.slice(taskIndex + 1)
          ]
        };
        return newData;
      });
      
      toast.success(newCompletedStatus ? "Task completed!" : "Task marked as incomplete");
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast.error("Failed to update task");
    }
  };
  
  // Add the missing deleteTask function
  const deleteTask = async (courseId: string, taskId: string) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "study_plans", taskId));
      
      // Update local state
      setStudyPlanData(prevData => {
        const courseIndex = prevData.findIndex(c => c.title === courseId);
        if (courseIndex === -1) return prevData;
        
        const newTasks = prevData[courseIndex].tasks.filter(t => t.id !== taskId);
        
        if (newTasks.length === 0) {
          // Remove the course if it has no more tasks
          return prevData.filter(c => c.title !== courseId);
        }
        
        const newData = [...prevData];
        newData[courseIndex] = {
          ...newData[courseIndex],
          tasks: newTasks
        };
        return newData;
      });
      
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Handle form submission for adding a new task
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get form data
    const formData = new FormData(e.currentTarget);
    const formValues = {
      title: formData.get('task-title') as string,
      course: formData.get('course') as string,
      time: formData.get('time') as string,
      duration: formData.get('duration') as string
    };

    // Validate form fields
    if (!formValues.title || !formValues.course || !formValues.time || !formValues.duration) {
      toast.error("Please fill out all fields");
      return;
    }

    // Add the task to Firestore
    await addTask(formValues);

    // Reset the form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Study Planner</h2>
            <p className="text-muted-foreground">
              Plan your study sessions and track your progress
            </p>
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-fit flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              className="gap-2"
              disabled={true} // Disable the button for now
            >
              <Bot className="h-4 w-4" />
              Generate AI Plan (Coming Soon)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {studyPlanData.map((course) => (
              <Card key={course.title}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg",
                          task.completed
                            ? "border-green-200 bg-green-50 dark:bg-green-900/10"
                            : "border-border"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer",
                              task.completed
                                ? "bg-green-500"
                                : "border border-muted"
                            )}
                            onClick={() =>
                              toggleTaskCompletion(course.title, task.id)
                            }
                          >
                            {task.completed && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {task.time}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {task.duration} min
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!task.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200"
                              onClick={() =>
                                toggleTaskCompletion(course.title, task.id)
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTask(course.title, task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Study Session</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      name="task-title"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      name="course"
                      placeholder="Select course"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="time">Start Time</Label>
                      <Input id="time" name="time" type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (min)</Label>
                      <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="5"
                        step="5"
                        defaultValue="30"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-2">
                    Add to Plan
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-fit">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Pomodoro Technique</h4>
                      <p className="text-sm text-muted-foreground">
                        Study for 25 minutes, then take a 5-minute break.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-fit">
                      <RotateCw className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Spaced Repetition</h4>
                      <p className="text-sm text-muted-foreground">
                        Review material at increasing intervals for better
                        retention.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-fit">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Active Recall</h4>
                      <p className="text-sm text-muted-foreground">
                        Test yourself rather than passively reviewing notes.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-fit">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cornell Note-Taking</h4>
                      <p className="text-sm text-muted-foreground">
                        Divide your notes into main points, details, and
                        summary.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
