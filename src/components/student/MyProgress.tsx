
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Target, 
  Flame, 
  TrendingUp,
  BookOpen
} from "lucide-react";

export const MyProgress = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("weekly");
  const [selectedSkill, setSelectedSkill] = useState("Web Development");

  // Mock data for charts - restructured to match the expected format
  const activityData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Hours Spent",
        data: [2.4, 1.3, 3.2, 5.2, 3.5, 2.3, 1.5],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true
      }
    ]
  };

  const courseProgressData = {
    labels: ["Web Dev", "Python", "Database", "UI/UX", "Mobile App"],
    datasets: [
      {
        label: "Completion",
        data: [75, 45, 90, 30, 60],
        backgroundColor: "#8b5cf6"
      }
    ]
  };

  const timeDistributionData = {
    labels: ["Watching Videos", "Reading Materials", "Assignments", "Quizzes", "Forums"],
    datasets: [
      {
        label: "Time Spent",
        data: [35, 25, 20, 15, 5],
        backgroundColor: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"]
      }
    ]
  };

  // New data for weekly goals
  const weeklyGoals = [
    { name: "Study Hours", current: 18, target: 25 },
    { name: "Assignments", current: 7, target: 10 },
    { name: "Quiz Score", current: 85, target: 90 },
    { name: "Reading Pages", current: 120, target: 150 }
  ];

  // Skill proficiency data
  const skillProficiencyData = {
    "Web Development": {
      skills: [
        { name: "HTML/CSS", level: 85 },
        { name: "JavaScript", level: 70 },
        { name: "React", level: 60 },
        { name: "Node.js", level: 45 },
        { name: "Database", level: 55 }
      ]
    },
    "Data Science": {
      skills: [
        { name: "Python", level: 75 },
        { name: "Statistics", level: 60 },
        { name: "Machine Learning", level: 40 },
        { name: "Data Visualization", level: 65 },
        { name: "SQL", level: 70 }
      ]
    },
    "UI/UX Design": {
      skills: [
        { name: "Wireframing", level: 80 },
        { name: "Prototyping", level: 65 },
        { name: "User Research", level: 55 },
        { name: "Visual Design", level: 70 },
        { name: "Design Systems", level: 50 }
      ]
    }
  };

  // Learning streak data
  const streakData = {
    currentStreak: 12,
    longestStreak: 21,
    thisWeek: 5,
    lastActivity: "Today"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Progress</h2>
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="allTime">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProgressStatCard 
          title="XP Level" 
          value="Level 15" 
          detail="2,540 / 3,000 XP"
          progress={84}
          icon={<Trophy className="h-5 w-5 text-primary" />}
        />
        <ProgressStatCard 
          title="Badges Earned" 
          value="12 Badges" 
          detail="3 this month"
          progress={60}
          icon={<Award className="h-5 w-5 text-primary" />}
        />
        <ProgressStatCard 
          title="Completed Tasks" 
          value="75%" 
          detail="45/60 assignments"
          progress={75}
          icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* New Learning Streak Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="bg-primary/20 rounded-full p-3">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">{streakData.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="bg-primary/20 rounded-full p-3">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">{streakData.longestStreak}</p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="bg-primary/20 rounded-full p-3">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">{streakData.thisWeek}</p>
              <p className="text-sm text-muted-foreground">Days this week</p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="bg-primary/20 rounded-full p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold">{streakData.lastActivity}</p>
              <p className="text-sm text-muted-foreground">Last Activity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goals Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyGoals.map((goal, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{goal.name}</p>
                  <p className="text-sm">
                    {goal.current}/{goal.target} 
                    <span className="text-muted-foreground ml-1">
                      ({Math.round((goal.current / goal.target) * 100)}%)
                    </span>
                  </p>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Set New Goals
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Learning Activity Chart */}
            <div className="h-[250px] flex items-center justify-center border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
              <p className="text-muted-foreground">Learning Activity Chart</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Course Progress Chart */}
            <div className="h-[250px] flex items-center justify-center border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
              <p className="text-muted-foreground">Course Progress Chart</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Proficiency Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Skill Proficiency</CardTitle>
            <Tabs value={selectedSkill} onValueChange={setSelectedSkill}>
              <TabsList>
                {Object.keys(skillProficiencyData).map((skill) => (
                  <TabsTrigger key={skill} value={skill}>
                    {skill}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillProficiencyData[selectedSkill].skills.map((skill, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{skill.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      skill.level < 40 ? "destructive" : 
                      skill.level < 70 ? "secondary" : 
                      "default"
                    }>
                      {skill.level < 40 ? "Beginner" : 
                       skill.level < 70 ? "Intermediate" : 
                       "Advanced"}
                    </Badge>
                    <span>{skill.level}%</span>
                  </div>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Time Distribution Chart */}
            <div className="h-[250px] flex items-center justify-center border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
              <p className="text-muted-foreground">Time Distribution Chart</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Perfect Attendance", desc: "Attended 7 classes in a row", xp: 150, date: "3 days ago" },
                { name: "Quiz Master", desc: "Scored 100% on 3 quizzes", xp: 200, date: "1 week ago" },
                { name: "Consistent Learner", desc: "Completed daily tasks for 5 days", xp: 100, date: "2 weeks ago" },
                { name: "Fast Learner", desc: "Completed a course 2 weeks ahead of schedule", xp: 300, date: "3 weeks ago" },
              ].map((badge, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{badge.name}</h4>
                      <Badge variant="outline" className="text-xs">+{badge.xp} XP</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{badge.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {badge.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface ProgressStatCardProps {
  title: string;
  value: string;
  detail: string;
  progress: number;
  icon: React.ReactNode;
}

const ProgressStatCard = ({ title, value, detail, progress, icon }: ProgressStatCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{title}</h3>
          <div className="bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
        <Progress value={progress} className="h-2 mt-4" />
      </CardContent>
    </Card>
  );
};
