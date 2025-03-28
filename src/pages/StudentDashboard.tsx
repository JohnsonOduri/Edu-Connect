
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyCourses } from "@/components/student/MyCourses";
import { MyProgress } from "@/components/student/MyProgress";
import { DiscussionForums } from "@/components/student/DiscussionForums";
import { StudyPlanner } from "@/components/student/StudyPlanner";
import { QuizGenerator } from "@/components/student/QuizGenerator";
import { MyAttendance } from "@/components/student/MyAttendance";
import { AICourseCreator } from "@/components/student/AICourseCreator";
import { StudentLab } from "@/components/student/StudentLab";
import { useState } from "react";

const StudentDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("courses");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        
        <Tabs defaultValue="courses" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="planner">Study Planner</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="quiz-generator">Practice Quizzes</TabsTrigger>
            <TabsTrigger value="lab">Coding Lab</TabsTrigger>
            <TabsTrigger value="ai-course">AI Course Creator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <MyCourses />
          </TabsContent>
          
          <TabsContent value="progress">
            <MyProgress />
          </TabsContent>
          
          <TabsContent value="attendance">
            <MyAttendance />
          </TabsContent>
          
          <TabsContent value="planner">
            <StudyPlanner />
          </TabsContent>
          
          <TabsContent value="discussions">
            <DiscussionForums />
          </TabsContent>
          
          <TabsContent value="quiz-generator">
            <QuizGenerator />
          </TabsContent>
          
          <TabsContent value="lab">
            <StudentLab />
          </TabsContent>
          
          <TabsContent value="ai-course">
            <AICourseCreator />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
