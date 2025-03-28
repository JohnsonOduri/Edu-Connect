
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, MapPin, Book, BookOpen, Download, List, RotateCw } from "lucide-react";
import { ref, push, set } from "firebase/database";
import { database } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

const lessonMapperSchema = z.object({
  subject: z.string().min(2, { message: "Subject is required" }),
  topic: z.string().min(2, { message: "Topic is required" }),
  gradeLevel: z.string(),
  duration: z.string(),
});

export const LessonMapper = ({ courseId }: { courseId?: string }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<{
    mainTopic: string;
    subtopics: {
      title: string;
      description: string;
      activities: string[];
      resources: string[];
    }[];
    learningObjectives: string[];
    suggestedTimeframe: string;
    assessmentIdeas: string[];
  } | null>(null);

  const form = useForm<z.infer<typeof lessonMapperSchema>>({
    resolver: zodResolver(lessonMapperSchema),
    defaultValues: {
      subject: "",
      topic: "",
      gradeLevel: "High School",
      duration: "1 week",
    },
  });

  const generateLessonPlan = async (values: z.infer<typeof lessonMapperSchema>) => {
    if (!user?.id) {
      toast.error("You must be logged in to generate a lesson plan");
      return;
    }

    setIsGenerating(true);

    try {
      // Call to Gemini API (using the existing setup from quiz generation)
      // For demonstration purposes, we'll simulate an API response
      const mockLessonPlan = {
        mainTopic: values.topic,
        subtopics: [
          {
            title: "Introduction to " + values.topic,
            description: "Basic concepts and historical context of " + values.topic,
            activities: [
              "Group discussion: What do we already know about " + values.topic + "?",
              "Video introduction followed by Q&A",
              "Interactive timeline exploration"
            ],
            resources: ["Introductory video", "Digital timeline", "Reading materials"]
          },
          {
            title: "Core Concepts of " + values.topic,
            description: "Detailed exploration of fundamental principles",
            activities: [
              "Guided practice problems",
              "Small group concept mapping",
              "Interactive digital simulation"
            ],
            resources: ["Practice worksheet", "Digital simulation tool", "Visual aids"]
          },
          {
            title: "Advanced Applications of " + values.topic,
            description: "Real-world applications and case studies",
            activities: [
              "Case study analysis",
              "Problem-based learning project",
              "Expert guest speaker (virtual or in-person)"
            ],
            resources: ["Case study documents", "Project materials", "Expert contact information"]
          },
          {
            title: "Review and Assessment of " + values.topic,
            description: "Consolidation of learning and formative assessment",
            activities: [
              "Knowledge check quiz",
              "Peer teaching activity",
              "Concept review game"
            ],
            resources: ["Review guide", "Assessment rubrics", "Digital quiz platform"]
          }
        ],
        learningObjectives: [
          "Students will explain the key principles of " + values.topic,
          "Students will apply concepts from " + values.topic + " to solve problems",
          "Students will analyze real-world examples related to " + values.topic,
          "Students will evaluate the significance of " + values.topic + " in the broader context of " + values.subject
        ],
        suggestedTimeframe: values.duration,
        assessmentIdeas: [
          "Portfolio of concept applications",
          "Project-based assessment with presentation",
          "Formative quizzes throughout the unit",
          "Reflective writing assignment"
        ]
      };

      // Simulate API delay
      setTimeout(() => {
        setLessonPlan(mockLessonPlan);
        setIsGenerating(false);
        toast.success("Lesson plan generated successfully");
      }, 2000);

    } catch (error) {
      console.error("Error generating lesson plan:", error);
      toast.error("Failed to generate lesson plan");
      setIsGenerating(false);
    }
  };

  const saveLessonPlan = async () => {
    if (!lessonPlan || !user?.id || !courseId) {
      toast.error(courseId ? "No lesson plan to save" : "Please select a course first");
      return;
    }

    try {
      // Save to Firebase
      const lessonPlanRef = push(ref(database, 'lesson_plans'));
      await set(lessonPlanRef, {
        course_id: courseId,
        teacher_id: user.id,
        subject: form.getValues().subject,
        topic: lessonPlan.mainTopic,
        grade_level: form.getValues().gradeLevel,
        duration: form.getValues().duration,
        subtopics: lessonPlan.subtopics,
        learning_objectives: lessonPlan.learningObjectives,
        suggested_timeframe: lessonPlan.suggestedTimeframe,
        assessment_ideas: lessonPlan.assessmentIdeas,
        created_at: new Date().toISOString(),
      });

      toast.success("Lesson plan saved successfully");
    } catch (error) {
      console.error("Error saving lesson plan:", error);
      toast.error("Failed to save lesson plan");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson Mapper</CardTitle>
        <CardDescription>
          Generate a structured lesson plan with topics and subtopics for your course
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {!lessonPlan ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(generateLessonPlan)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics, Biology, Literature" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Quadratic Equations, Photosynthesis, Shakespeare" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Elementary">Elementary</SelectItem>
                            <SelectItem value="Middle School">Middle School</SelectItem>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="College">College</SelectItem>
                            <SelectItem value="Graduate">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1 class">Single Class</SelectItem>
                            <SelectItem value="1 week">1 Week</SelectItem>
                            <SelectItem value="2 weeks">2 Weeks</SelectItem>
                            <SelectItem value="1 month">1 Month</SelectItem>
                            <SelectItem value="1 semester">Full Semester</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Lesson Plan...
                    </span>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Generate Lesson Plan
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{lessonPlan.mainTopic}</h3>
                  <Badge variant="outline" className="text-xs">
                    {form.getValues().subject} | {form.getValues().gradeLevel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Suggested timeframe: {lessonPlan.suggestedTimeframe}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Book className="h-4 w-4 mr-2 text-primary" />
                  Learning Objectives
                </h4>
                <ul className="ml-6 space-y-1 list-disc text-sm">
                  {lessonPlan.learningObjectives.map((objective, i) => (
                    <li key={i}>{objective}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center">
                  <List className="h-4 w-4 mr-2 text-primary" />
                  Lesson Sequence
                </h4>
                
                {lessonPlan.subtopics.map((subtopic, i) => (
                  <div key={i} className="border rounded-md p-4 space-y-3">
                    <h5 className="font-medium">
                      {i + 1}. {subtopic.title}
                    </h5>
                    <p className="text-sm text-muted-foreground">{subtopic.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h6 className="text-xs font-medium">Activities</h6>
                        <ul className="ml-4 space-y-1 list-disc text-xs">
                          {subtopic.activities.map((activity, j) => (
                            <li key={j}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h6 className="text-xs font-medium">Resources</h6>
                        <ul className="ml-4 space-y-1 list-disc text-xs">
                          {subtopic.resources.map((resource, j) => (
                            <li key={j}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  Assessment Ideas
                </h4>
                <ul className="ml-6 space-y-1 list-disc text-sm">
                  {lessonPlan.assessmentIdeas.map((idea, i) => (
                    <li key={i}>{idea}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveLessonPlan} disabled={!courseId}>
                  <Download className="mr-2 h-4 w-4" />
                  Save to Course
                </Button>
                <Button variant="outline" onClick={() => setLessonPlan(null)}>
                  Create New
                </Button>
                {!courseId && (
                  <p className="text-xs text-amber-500 mt-2 w-full">
                    Please select a course before saving this lesson plan
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Missing component from above code
const Badge = ({ variant, className, children }: { variant?: string, className?: string, children: React.ReactNode }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${variant === "outline" ? "border" : "bg-primary text-white"} ${className}`}>
      {children}
    </span>
  );
};
