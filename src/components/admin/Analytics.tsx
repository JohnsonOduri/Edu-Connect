
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, BarChart, PieChart } from "@/components/ui/recharts";
import { Button } from "@/components/ui/button";
import { Download, BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, Users, BookOpen, Clock, Download as DownloadIcon } from "lucide-react";

export const Analytics = () => {
  // Sample chart data - in a real application these would come from API calls
  const userData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [30, 40, 45, 50, 49, 60],
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsla(var(--primary), 0.1)",
        fill: true,
      },
    ],
  };
  
  const courseData = {
    labels: ["Web Dev", "Data Science", "Design", "Mobile", "AI", "DevOps"],
    datasets: [
      {
        label: "Enrollments",
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: [
          "hsla(var(--primary), 0.8)",
          "hsla(var(--primary), 0.7)",
          "hsla(var(--primary), 0.6)",
          "hsla(var(--primary), 0.5)",
          "hsla(var(--primary), 0.4)",
          "hsla(var(--primary), 0.3)",
        ],
      },
    ],
  };
  
  const engagementData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Logins",
        data: [250, 300, 280, 320, 300, 350],
        backgroundColor: "hsla(var(--primary), 0.5)",
      },
      {
        label: "Course Views",
        data: [200, 250, 240, 280, 260, 300],
        backgroundColor: "hsla(var(--primary), 0.8)",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          <p className="text-muted-foreground mt-1">
            Track platform performance and user engagement
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticCard
          title="Total Users"
          value="2,846"
          trend="+12%"
          description="vs. previous period"
          icon={<Users className="h-5 w-5 text-primary" />}
          positive
        />
        <AnalyticCard
          title="Active Courses"
          value="128"
          trend="+5%"
          description="vs. previous period"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          positive
        />
        <AnalyticCard
          title="Completion Rate"
          value="68%"
          trend="-3%"
          description="vs. previous period"
          icon={<Clock className="h-5 w-5 text-primary" />}
          positive={false}
        />
        <AnalyticCard
          title="Avg. Engagement"
          value="24 min"
          trend="+8%"
          description="vs. previous period"
          icon={<BarChartIcon className="h-5 w-5 text-primary" />}
          positive
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart data={userData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Popular Courses</CardTitle>
                <CardDescription>Enrollment distribution by course category</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart data={courseData} />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Platform Engagement</CardTitle>
                <CardDescription>Login and course view activity</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={engagementData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user statistics and demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Detailed user analytics would be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>Detailed course performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Detailed course analytics would be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>User activity and interaction data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Detailed engagement metrics would be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface AnalyticCardProps {
  title: string;
  value: string;
  trend: string;
  description: string;
  icon: React.ReactNode;
  positive: boolean;
}

const AnalyticCard = ({ title, value, trend, description, icon, positive }: AnalyticCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs font-medium ${positive ? 'text-green-500' : 'text-red-500'}`}>
                {trend}
              </span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
