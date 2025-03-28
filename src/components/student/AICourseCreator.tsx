import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, PlusCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { CourseViewer } from "./CourseViewer";
import { AIGeneratedCourse, TopicPdf } from "./types/ai-course-types";
import { db } from "@/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Base64 } from "js-base64";

const GEMINI_API_KEY = "AIzaSyC7lI04maXXCzhqWXAeMp5J9oqjllS0mXA";

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  syllabus: z.string().min(10, "Syllabus must be at least 10 characters"),
  durationDays: z.coerce
    .number()
    .min(1, "Duration must be at least 1 day")
    .max(30, "Duration cannot exceed 30 days"),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export const AICourseCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedCourse, setGeneratedCourse] =
    useState<AIGeneratedCourse | null>(null);
  const [savedCourses, setSavedCourses] = useState<AIGeneratedCourse[]>([]);
  const [activeTab, setActiveTab] = useState<string>("create");
  const { toast } = useToast();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      syllabus: "",
      durationDays: 7,
    },
  });

  const generateCourseWithGemini = async (values: CourseFormValues) => {
    const apiKey = GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const prompt = `
    Generate a detailed learning resource about "${values.title}" that spans ${values.durationDays} days.
    Based on this syllabus: ${values.syllabus}

    For each day (module), include:
    1. A descriptive title
    2. A short description
    3. 2 topics per module
    
    For each topic include:
    1. A title
    2. Detailed theory explanation (at least 400 words with proper headings and subheadings)
    3. 3 practice questions with answers
    4. 3 learning resources (mix of YouTube videos, websites, and articles)
    
    Format as JSON following this exact structure without any additional text or comments:
    {
      "modules": [
        {
          "title": "Module title",
          "description": "Module description",
          "topics": [
            {
              "title": "Topic title",
              "theory": "Detailed theory explanation with proper formatting",
              "practiceQuestions": [
                {"question": "Question text?", "answer": "Answer text"},
                {"question": "Question text?", "answer": "Answer text"},
                {"question": "Question text?", "answer": "Answer text"}
              ],
              "resources": [
                {"type": "youtube|website|article", "title": "Resource title", "url": "URL", "description": "Short description"},
                {"type": "youtube|website|article", "title": "Resource title", "url": "URL", "description": "Short description"},
                {"type": "youtube|website|article", "title": "Resource title", "url": "URL", "description": "Short description"}
              ]
            }
          ]
        }
      ]
    }`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const aiResponse = await response.json();

    if (
      !aiResponse.candidates ||
      !aiResponse.candidates[0] ||
      !aiResponse.candidates[0].content ||
      !aiResponse.candidates[0].content.parts ||
      !aiResponse.candidates[0].content.parts[0]
    ) {
      throw new Error("Invalid response from Gemini API");
    }

    const generatedText = aiResponse.candidates[0].content.parts[0].text;

    const jsonMatch = generatedText.match(/\{[\s\S]*?\}\s*$/);
    let jsonContent = jsonMatch ? jsonMatch[0] : generatedText;

    jsonContent = jsonContent.replace(/```json|```/g, "").trim();

    try {
      const parsedContent = JSON.parse(jsonContent);

      const topicPdfContents: TopicPdf[] = [];

      parsedContent.modules.forEach((module: any, moduleIndex: number) => {
        module.topics.forEach((topic: any, topicIndex: number) => {
          const pdfContent = `
${module.title} - ${topic.title}
Day ${moduleIndex + 1}, Topic ${topicIndex + 1}

${topic.theory}

Practice Questions:
${topic.practiceQuestions
  .map(
    (q: any, i: number) => `
Question ${i + 1}: 
${q.question}

Answer: ${q.answer}
`
  )
  .join("\n")}

Learning Resources:
${topic.resources
  .map(
    (r: any, i: number) => `
Resource ${i + 1}: ${r.title}
Type: ${r.type}
URL: ${r.url}
Description: ${r.description || "No description provided"}
`
  )
  .join("\n")}
        `;

          topicPdfContents.push({
            id: crypto.randomUUID(),
            moduleId: module.id || crypto.randomUUID(),
            moduleTitle: module.title,
            moduleDay: moduleIndex + 1,
            topicTitle: topic.title,
            pdfContent: pdfContent,
            contentBase64: Base64.encode(pdfContent),
          });
        });
      });

      const fullCourse: AIGeneratedCourse = {
        id: crypto.randomUUID(),
        title: values.title,
        description: `An AI-generated course about ${values.title} based on the provided syllabus.`,
        syllabus: values.syllabus,
        durationDays: values.durationDays,
        modules: parsedContent.modules.map((module: any, index: number) => ({
          ...module,
          id: crypto.randomUUID(),
          day: index + 1,
          topics: module.topics.map((topic: any) => ({
            ...topic,
            id: crypto.randomUUID(),
            practiceQuestions: topic.practiceQuestions.map((q: any) => ({
              ...q,
              id: crypto.randomUUID(),
            })),
            resources: topic.resources.map((r: any) => ({
              ...r,
              id: crypto.randomUUID(),
            })),
          })),
        })),
        topicPdfs: topicPdfContents,
        createdAt: new Date().toISOString(),
      };

      return fullCourse;
    } catch (error: any) {
      console.error("JSON parsing error:", error);
      console.error("Raw text received:", generatedText);
      throw new Error(
        `Failed to parse JSON from API response: ${error.message}`
      );
    }
  };

  const onSubmit = async (values: CourseFormValues) => {
    setLoading(true);
    try {
      toast({
        title: "Generating course with PDF resources...",
        description:
          "This may take a few minutes depending on the course complexity.",
      });

      const course = await generateCourseWithGemini(values);
      console.log("Generated course with PDFs:", course);

      setGeneratedCourse(course);
      setActiveTab("view");

      toast({
        title: "Course generated successfully!",
        description:
          "Your AI-generated course with downloadable PDFs is ready to explore.",
      });
    } catch (error: any) {
      console.error("Failed to generate course:", error);
      toast({
        title: "Course generation failed",
        description:
          error.message || "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCourseToFirestore = async (course: AIGeneratedCourse) => {
    try {
      const docRef = await addDoc(collection(db, "courses"), course);
      toast({
        title: "Course saved successfully!",
        description: `Course ID: ${docRef.id}`,
      });
      fetchSavedCourses(); // Refresh the list of saved courses
    } catch (error) {
      console.error("Error saving course: ", error);
      toast({
        title: "Failed to save course",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchSavedCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const courses: AIGeneratedCourse[] = [];
      querySnapshot.forEach((doc) => {
        courses.push(doc.data() as AIGeneratedCourse);
      });
      setSavedCourses(courses);
    } catch (error) {
      console.error("Error fetching courses: ", error);
      toast({
        title: "Failed to fetch courses",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSavedCourses();
  }, []);

  const viewCourse = (course: AIGeneratedCourse) => {
    setGeneratedCourse(course);
    setActiveTab("view");
  };

  return (
    <div className="container mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="create">Create New Course</TabsTrigger>
          <TabsTrigger value="view" disabled={!generatedCourse}>
            View Generated Course
          </TabsTrigger>
          <TabsTrigger value="saved">Saved Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Course Creator with PDF Resources</CardTitle>
              <CardDescription>
                Enter a course syllabus and duration to generate a personalized
                learning path with downloadable PDF resources for each topic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., Introduction to Machine Learning"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a descriptive title for your course
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="syllabus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Syllabus</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the key topics and concepts you want to cover in this course..."
                            className="min-h-40"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide as much detail as possible about what you want
                          to learn
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Duration (days)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={30} {...field} />
                        </FormControl>
                        <FormDescription>
                          How many days do you want to spread this course over?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Course & PDFs...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Generate Course with PDFs
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          {generatedCourse && (
            <CourseViewer 
              course={generatedCourse} 
              onSave={() => saveCourseToFirestore(generatedCourse)}
            />
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Courses</CardTitle>
              <CardDescription>
                View and manage your saved courses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedCourses.length > 0 ? (
                <div className="space-y-4">
                  {savedCourses.map((course) => (
                    <div key={course.id} className="border p-4 rounded-md">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{course.durationDays} days</Badge>
                        <Badge variant="secondary">{course.modules.length} modules</Badge>
                      </div>
                      <Button
                        onClick={() => viewCourse(course)}
                        className="mt-4"
                      >
                        View Course
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No courses saved yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
