
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Calendar, Clock, Plus } from "lucide-react";

export const AssignmentManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Assignment & Grading</h2>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">Database Design Project</h3>
                    <Badge>Due in 3 days</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Web Development - John Doe</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      <span>18/25 submitted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>100 points</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Grading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">JavaScript Basics Quiz</h3>
                    <Badge variant="outline">12 submissions</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Frontend Development - Alice Smith</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Due date passed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>50 points</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recently Graded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">Python Data Structures</h3>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Backend Development - Robert Johnson</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      <span>25/25 graded</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Avg: 87/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Grade Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Completed Assignments" value="48" subtitle="This semester" />
          <StatsCard title="Average Score" value="82%" subtitle="Across all courses" />
          <StatsCard title="Highest Grade" value="98%" subtitle="Advanced Python" />
          <StatsCard title="Grade Improvements" value="+12%" subtitle="From last semester" />
        </div>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const StatsCard = ({ title, value, subtitle }: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};
