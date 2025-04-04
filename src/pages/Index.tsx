
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  BookOpen, 
  Code, 
  GraduationCap, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  CheckCircle
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  <span>Next-Gen Learning Platform</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Revolutionize Your Educational Experience
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px]">
                  EduConnect combines cutting-edge technology with proven educational methodologies to create an unparalleled learning environment.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/login">
                    <Button size="lg" className="rounded-full">
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="rounded-full">
                      Learn More
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Powerful Learning Tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">AI-powered Learning</span>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl opacity-50"></div>
                <div className="relative bg-background/80 backdrop-blur shadow-xl rounded-3xl border border-border overflow-hidden">
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted/50 rounded-full w-2/3"></div>
                        <div className="h-4 bg-muted/50 rounded-full w-full"></div>
                        <div className="h-4 bg-muted/50 rounded-full w-4/5"></div>
                      </div>
                      <div className="flex justify-end">
                        <div className="h-8 bg-primary/10 rounded-full w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Designed for Modern Education
              </h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-[700px] mx-auto">
                Our comprehensive suite of tools empowers both educators and students
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Comprehensive Courses"
                description="Access a wide range of interactive content and engaging assessments"
              />
              <FeatureCard
                icon={<Code className="h-8 w-8" />}
                title="Interactive Coding Lab"
                description="Learn programming with hands-on practice and real-time feedback"
              />
              <FeatureCard
                icon={<Brain className="h-8 w-8" />}
                title="AI-Assisted Learning"
                description="Benefit from personalized recommendations and insights"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl max-w-[800px]">
                Ready to Transform Your Educational Experience?
              </h2>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Join thousands of educators and students already using EduConnect
              </p>
              <Link to="/login">
                <Button size="lg" className="rounded-full">
                  Get Started Now
                </Button>
              </Link>
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
    <div className="flex flex-col items-center text-center space-y-4 p-6 bg-card border rounded-xl shadow-sm">
      <div className="p-3 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
