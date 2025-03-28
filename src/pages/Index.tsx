
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Bot, Brain, Shield, Sparkles, Users, TestTube, GraduationCap, FileCode } from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Modern Learning Platform
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Empower your educational journey with our comprehensive learning platform powered by AI
              </p>
              <div className="space-x-4">
                <Link to="/login">
                  <Button>Get Started</Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline">Browse Courses</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Platform Features
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need for effective learning and teaching
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<BookOpen className="h-10 w-10 text-primary" />}
                title="Comprehensive Courses"
                description="Access a wide range of courses with interactive content and assessments."
              />
              <FeatureCard
                icon={<Shield className="h-10 w-10 text-primary" />}
                title="Secure Platform"
                description="Enterprise-grade security to protect your data and privacy."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Collaborative Learning"
                description="Engage with peers and instructors through forums and live sessions."
              />
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-purple-50 dark:bg-purple-950/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full text-purple-800 dark:text-purple-300 text-sm font-medium inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Advanced AI Features
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Cutting-edge artificial intelligence to enhance your educational experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <Card className="bg-background/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800/30 shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                      <Bot className="h-6 w-6 text-purple-800 dark:text-purple-300" />
                    </div>
                    <CardTitle>AI Content Checker</CardTitle>
                  </div>
                  <CardDescription>
                    For administrators and educators to validate the authenticity of student submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detect AI-generated content and check for plagiarism in student submissions with our advanced machine learning algorithms.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin/ai-checker" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Bot className="h-4 w-4 mr-2" />
                      Try AI Checker
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-background/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800/30 shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                      <Brain className="h-6 w-6 text-purple-800 dark:text-purple-300" />
                    </div>
                    <CardTitle>AI Study Planner</CardTitle>
                  </div>
                  <CardDescription>
                    For students to optimize their learning schedule and improve productivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create personalized study plans based on your courses, learning style, and schedule using our intelligent AI algorithms.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/student/ai-planner" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Try AI Planner
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-background/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800/30 shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                      <TestTube className="h-6 w-6 text-purple-800 dark:text-purple-300" />
                    </div>
                    <CardTitle>AI Quiz Generator</CardTitle>
                  </div>
                  <CardDescription>
                    For students to test their knowledge with AI-generated quizzes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate custom quizzes based on your learning materials and get instant feedback on your answers using DeepSeek AI.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/student/quiz-generator" className="w-full">
                    <Button variant="outline" className="w-full">
                      <TestTube className="h-4 w-4 mr-2" />
                      Try AI Quizzes
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Learning?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of students and educators on our platform
              </p>
              <div className="space-x-4">
                <Link to="/login">
                  <Button size="lg">Get Started Today</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-lg bg-card shadow-sm">
      <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const CheckItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-green-500/10 p-1">
        <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
};

export default Index;
