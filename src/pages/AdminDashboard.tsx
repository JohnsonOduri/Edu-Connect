
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { CourseManagement } from "@/components/admin/CourseManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { AssignmentManagement } from "@/components/admin/AssignmentManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { Communications } from "@/components/admin/Communications";
import { Analytics } from "@/components/admin/Analytics";
import { Integrations } from "@/components/admin/Integrations";
import { AiChecker } from "@/components/admin/AiChecker";
import { LayoutDashboard, Users, BookOpen, FileText, CheckSquare, Settings, MessageSquare, BarChart, Plug, Bot, Sparkles } from "lucide-react";

const AdminDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Set initial tab based on location state if provided
  useEffect(() => {
    if (location.state && location.state.defaultTab) {
      setActiveTab(location.state.defaultTab);
    }
  }, [location.state]);

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

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your educational platform and users
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden md:inline">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Communications</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              <span className="hidden md:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="ai-checker" className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
              <Bot className="h-4 w-4" />
              <span className="hidden md:inline">AI Checker</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatCard
                title="Total Users"
                value="256"
                subtitle="Last 30 days"
                icon={<Users className="h-5 w-5 text-primary" />}
              />
              <AdminStatCard
                title="Active Courses"
                value="24"
                subtitle="Currently running"
                icon={<BookOpen className="h-5 w-5 text-primary" />}
              />
              <AdminStatCard
                title="New Enrollments"
                value="128"
                subtitle="Last 30 days"
                icon={<CheckSquare className="h-5 w-5 text-primary" />}
              />
              <AdminStatCard
                title="Completion Rate"
                value="87%"
                subtitle="Course completions"
                icon={<BarChart className="h-5 w-5 text-primary" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-card p-6 rounded-lg border border-border shadow-subtle">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{i}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">New user registration</h4>
                        <p className="text-muted-foreground text-sm">John Smith registered as a student</p>
                        <p className="text-xs text-muted-foreground mt-1">{i} hour{i !== 1 ? 's' : ''} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border shadow-subtle">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionButton
                    title="Add User"
                    icon={<Users className="h-5 w-5" />}
                    onClick={() => setActiveTab("users")}
                  />
                  <QuickActionButton
                    title="Create Course"
                    icon={<BookOpen className="h-5 w-5" />}
                    onClick={() => setActiveTab("courses")}
                  />
                  <QuickActionButton
                    title="Send Notification"
                    icon={<MessageSquare className="h-5 w-5" />}
                    onClick={() => setActiveTab("communications")}
                  />
                  <QuickActionButton
                    title="View Reports"
                    icon={<BarChart className="h-5 w-5" />}
                    onClick={() => setActiveTab("analytics")}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>
          
          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>
          
          <TabsContent value="assignments">
            <AssignmentManagement />
          </TabsContent>
          
          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
          
          <TabsContent value="communications">
            <Communications />
          </TabsContent>
          
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
          
          <TabsContent value="integrations">
            <Integrations />
          </TabsContent>

          <TabsContent value="ai-checker">
            <AiChecker />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

interface AdminStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

const AdminStatCard = ({ title, value, subtitle, icon }: AdminStatCardProps) => {
  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{title}</h3>
        <div className="bg-primary/10 p-2 rounded-full">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
  );
};

interface QuickActionButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickActionButton = ({ title, icon, onClick }: QuickActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-4 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
    >
      <div className="p-3 bg-primary/10 rounded-full">
        {icon}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
};

export default AdminDashboard;
