
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModuleItem } from "./ModuleItem";
import { PdfTopicViewer } from "./PdfTopicViewer";
import { AIGeneratedCourse } from "./types/ai-course-types";
import { FileText, BookOpen, Save } from "lucide-react";

interface CourseViewerProps {
  course: AIGeneratedCourse;
  onSave?: () => void;
}

export const CourseViewer: React.FC<CourseViewerProps> = ({ course, onSave }) => {
  const [viewMode, setViewMode] = useState<"course" | "pdfs">("course");
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>
            {course.description}
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{course.durationDays} days</Badge>
              <Badge variant="secondary">{course.modules.length} modules</Badge>
              {course.topicPdfs && (
                <Badge variant="secondary">{course.topicPdfs.length} PDF topics</Badge>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Course Syllabus</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground mb-4">
            {course.syllabus}
          </p>

          <Tabs defaultValue="course" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="course" onClick={() => setViewMode("course")}>
                <BookOpen className="h-4 w-4 mr-2" /> Course View
              </TabsTrigger>
              <TabsTrigger value="pdfs" onClick={() => setViewMode("pdfs")}>
                <FileText className="h-4 w-4 mr-2" /> PDF Topics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="course">
              <h3 className="text-lg font-semibold mt-2 mb-4">Modules</h3>
              <Accordion type="single" collapsible className="w-full">
                {course.modules.map((module) => (
                  <ModuleItem key={module.id} module={module} />
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="pdfs">
              {course.topicPdfs && course.topicPdfs.length > 0 ? (
                <PdfTopicViewer 
                  topicPdfs={course.topicPdfs} 
                  courseName={course.title}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No PDF topics available for this course.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.print()}>
            Print Course Materials
          </Button>
          {onSave && (
            <Button onClick={onSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Course
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
