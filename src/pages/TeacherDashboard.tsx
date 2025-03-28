
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCreator } from "@/components/teacher/CourseCreator";
import { CourseDetails } from "@/components/teacher/CourseDetails";
import { useState } from "react";

const TeacherDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses">("courses");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
        
        {!selectedCourse ? (
          <Tabs defaultValue="courses" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-6">
              <TabsTrigger value="courses">My Courses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <CourseCreator onCourseSelect={setSelectedCourse} />
            </TabsContent>
          </Tabs>
        ) : (
          <CourseDetails courseId={selectedCourse} onBack={() => setSelectedCourse(null)} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
