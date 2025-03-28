
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Book, Brain, CheckCircle, Sparkles, FileText, Users } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user?.role === "student") {
      navigate("/student");
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Select a dashboard to continue:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {user?.role === "admin" && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                <CardDescription>Manage users, courses, and platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-white dark:bg-black/20 rounded-lg p-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>User Management</span>
                  </div>
                  <div className="bg-white dark:bg-black/20 rounded-lg p-3 flex items-center gap-2">
                    <Book className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Course Management</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate("/admin")} className="w-full">Go to Admin Dashboard</Button>
              </CardFooter>
            </Card>
          )}
          
          {user?.role === "student" && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-2xl">Student Dashboard</CardTitle>
                <CardDescription>Access your courses, assignments, and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-white dark:bg-black/20 rounded-lg p-3 flex items-center gap-2">
                    <Book className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span>My Courses</span>
                  </div>
                  <div className="bg-white dark:bg-black/20 rounded-lg p-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span>Assignments</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate("/student")} className="w-full">Go to Student Dashboard</Button>
              </CardFooter>
            </Card>
          )}

          {/* AI Features Card - For Both Roles */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                AI Features
              </CardTitle>
              <CardDescription>Access our AI-powered tools to enhance your learning experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {user?.role === "admin" && (
                  <div 
                    onClick={() => navigate("/admin/ai-checker")}
                    className="bg-white dark:bg-black/20 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium">AI Content Checker</h3>
                      <p className="text-sm text-muted-foreground">Detect AI-generated content and check for plagiarism in student submissions</p>
                    </div>
                  </div>
                )}
                
                {user?.role === "student" && (
                  <div 
                    onClick={() => navigate("/student/ai-planner")}
                    className="bg-white dark:bg-black/20 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium">AI Study Planner</h3>
                      <p className="text-sm text-muted-foreground">Generate personalized study schedules based on your courses and deadlines</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-white dark:bg-black/20 rounded-lg p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">AI Features Coming Soon</h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.role === "admin" 
                        ? "Analytics insights, automated grading, and personalized feedback tools" 
                        : "Concept explanations, practice question generation, and personalized feedback"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="secondary" 
                onClick={() => {
                  if (user?.role === "admin") {
                    navigate("/admin/ai-checker");
                  } else if (user?.role === "student") {
                    navigate("/student/ai-planner");
                  }
                  toast.success("Redirecting to AI features!");
                }} 
                className="w-full gap-2"
              >
                <Bot className="h-4 w-4" />
                {user?.role === "admin" ? "Go to AI Checker" : "Go to AI Study Planner"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
