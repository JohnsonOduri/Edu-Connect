
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Star, Medal, BookOpen, CheckCircle, Clock, UserCircle2 } from "lucide-react";

export const LeaderboardView = () => {
  const [timeframe, setTimeframe] = useState("weekly");
  const [courseFilter, setCourseFilter] = useState("all");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <p className="text-muted-foreground">Track your progress and compete with peers</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="allTime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="webdev">Web Development</SelectItem>
              <SelectItem value="database">Database Design</SelectItem>
              <SelectItem value="mobile">Mobile Development</SelectItem>
              <SelectItem value="ui">UI/UX Design</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-around md:justify-center md:gap-12 mb-16">
                  {/* Second Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-silver">
                        <AvatarImage src="https://i.pravatar.cc/150?u=2" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-silver text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                    </div>
                    <h3 className="mt-6 font-medium">Sarah Johnson</h3>
                    <p className="text-sm text-muted-foreground">4,850 XP</p>
                  </div>
                  
                  {/* First Place */}
                  <div className="flex flex-col items-center relative -top-8">
                    <div className="relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <Award className="h-8 w-8 text-amber-500" />
                      </div>
                      <Avatar className="h-24 w-24 border-4 border-amber-500">
                        <AvatarImage src="https://i.pravatar.cc/150?u=1" />
                        <AvatarFallback>AC</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                    </div>
                    <h3 className="mt-6 font-medium">Alex Chen</h3>
                    <p className="text-sm text-muted-foreground">5,240 XP</p>
                  </div>
                  
                  {/* Third Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-amber-700">
                        <AvatarImage src="https://i.pravatar.cc/150?u=3" />
                        <AvatarFallback>MG</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                    </div>
                    <h3 className="mt-6 font-medium">Maria Garcia</h3>
                    <p className="text-sm text-muted-foreground">4,560 XP</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[4, 5, 6, 7, 8, 9, 10].map(rank => (
                    <div 
                      key={rank} 
                      className="flex items-center p-3 rounded-lg border"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-sm font-medium">
                        {rank}
                      </div>
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${rank+10}`} />
                        <AvatarFallback>
                          <UserCircle2 className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">
                          {[
                            "David Kim", 
                            "Lisa Wong", 
                            "James Smith", 
                            "Emily Davis",
                            "Michael Johnson",
                            "Sophia Martinez",
                            "Robert Wilson"
                          ][rank-4]}
                        </div>
                        <div className="flex items-center text-sm">
                          <BookOpen className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground">{["Web Development", "Database Design", "UI/UX Design", "Mobile Development", "Web Development", "Machine Learning", "Database Design"][rank-4]}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{Math.floor(5000 - (rank * 150))} XP</div>
                        <div className="text-xs text-muted-foreground">Level {Math.floor(20 - (rank-3))}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline">View Full Leaderboard</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-primary" />
                Your Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-base font-medium text-primary">
                  15
                </div>
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarFallback>YO</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-lg">You</div>
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Multiple Courses</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">3,780 XP</div>
                  <div className="text-sm">Level 15</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-primary">+205</div>
                  <div className="text-sm text-muted-foreground">XP This Week</div>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-primary">+3</div>
                  <div className="text-sm text-muted-foreground">Rank Improvement</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Your Recent Achievements</h3>
                <div className="space-y-2">
                  {[
                    { name: "Perfect Attendance", xp: 150, icon: CheckCircle },
                    { name: "Quiz Master", xp: 200, icon: Star },
                    { name: "Consistent Learner", xp: 100, icon: Medal },
                  ].map((badge, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {React.createElement(badge.icon, { className: "h-4 w-4 text-primary" })}
                        </div>
                        <span className="font-medium text-sm">{badge.name}</span>
                      </div>
                      <Badge variant="outline" className="text-primary">+{badge.xp} XP</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Courses Completed</span>
                  <span className="font-medium">3/8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Assignments Completed</span>
                  <span className="font-medium">24/32</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Discussion Participation</span>
                  <span className="font-medium">15 posts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Quiz Score</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Study Streak</span>
                  <span className="font-medium">7 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const silver = "rgb(192, 192, 192)";
