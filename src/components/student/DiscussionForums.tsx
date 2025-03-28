
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, Video, Mic, Plus, ThumbsUp, MessageCircle, Clock, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

export const DiscussionForums = () => {
  const [activeTab, setActiveTab] = useState("discussions");
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [postType, setPostType] = useState<"text" | "audio" | "video">("text");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Discussion Forums</h2>
          <p className="text-muted-foreground">Engage with your peers and instructors</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            setPostType("text");
            setIsNewPostDialogOpen(true);
          }}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Text Post
          </Button>
          <Button variant="outline" onClick={() => {
            setPostType("audio");
            setIsNewPostDialogOpen(true);
          }}>
            <Mic className="h-4 w-4 mr-2" />
            Audio Post
          </Button>
          <Button onClick={() => {
            setPostType("video");
            setIsNewPostDialogOpen(true);
          }}>
            <Video className="h-4 w-4 mr-2" />
            Video Post
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="discussions">All Discussions</TabsTrigger>
          <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          <TabsTrigger value="course-specific">Course Specific</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {["Web Development", "Database Design", "Mobile App Development"].map((course, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2">{course}</Badge>
                      <CardTitle className="text-lg">Understanding {course === "Web Development" ? "CSS Grid vs Flexbox" : course === "Database Design" ? "SQL Joins" : "React Native Navigation"}</CardTitle>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {12 - i * 3}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <span>Sarah Johnson</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{i + 1} day{i !== 0 ? 's' : ''} ago</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    {course === "Web Development" 
                      ? "I'm having trouble understanding when to use CSS Grid versus Flexbox. Could someone explain the key differences and use cases for each?" 
                      : course === "Database Design"
                        ? "Can someone explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN in SQL? I'm especially confused about when to use each type." 
                        : "I'm struggling with setting up a stack navigator in React Native. Has anyone implemented a nested navigation structure they could share?"
                    }
                  </p>
                  
                  {i === 1 && (
                    <div className="mb-4">
                      <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Mic className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md">
                            <div className="h-2 bg-primary rounded-full relative">
                              <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Audio recording: 1:24</p>
                    </div>
                  )}
                  
                  {i === 2 && (
                    <div className="mb-4">
                      <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md">
                            <div className="h-2 bg-muted-foreground rounded-full relative">
                              <div className="absolute top-1/2 -translate-y-1/2 left-3/4 w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Video: Screen recording of navigation setup (2:45)</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {5 - i}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                </CardContent>
                
                <div className="border-t px-6 py-4">
                  <h4 className="font-medium text-sm mb-3">Recent Replies</h4>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${i+10}`} />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Professor Anderson</span>
                          <Badge variant="outline" className="text-xs">Instructor</Badge>
                        </div>
                        <p className="text-sm">
                          {course === "Web Development" 
                            ? "Grid is 2-dimensional while Flexbox is 1-dimensional. Use Grid for overall page layout and Flexbox for components."
                            : course === "Database Design"
                              ? "INNER JOIN returns matches in both tables, LEFT keeps all from first, RIGHT keeps all from second table."
                              : "Stack Navigator is for screen-to-screen navigation. Check out my example repository for nested navigation patterns."
                          }
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            3
                          </Button>
                          <span className="text-xs text-muted-foreground">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardFooter className="border-t p-4">
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <UserCircle2 className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Input placeholder="Add your reply..." className="flex-1" />
                    <Button size="sm">Reply</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Forums</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Web Development", count: 24 },
                    { name: "Database Design", count: 18 },
                    { name: "Mobile App Development", count: 15 },
                    { name: "UI/UX Design", count: 12 },
                    { name: "Machine Learning", count: 10 },
                  ].map((forum, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Button variant="link" className="p-0 h-auto font-normal justify-start">
                        {forum.name}
                      </Button>
                      <Badge variant="outline">{forum.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Browse All Forums
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${i+20}`} />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {["John Smith", "Sarah Johnson", "Alex Chen", "Maria Garcia", "David Kim"][i-1]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {[
                              "Web Development",
                              "Database Design",
                              "UI/UX Design",
                              "Mobile App Development",
                              "Machine Learning"
                            ][i-1]}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">{56 - (i * 8)} posts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
      
      {/* New Post Dialog */}
      <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {postType === "text" ? (
                <>
                  <MessageSquare className="h-5 w-5" />
                  Create Text Post
                </>
              ) : postType === "audio" ? (
                <>
                  <Mic className="h-5 w-5" />
                  Create Audio Post
                </>
              ) : (
                <>
                  <Video className="h-5 w-5" />
                  Create Video Post
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input placeholder="Post title" />
            </div>
            
            {postType === "text" ? (
              <Textarea placeholder="What would you like to discuss?" rows={5} />
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  {postType === "audio" ? (
                    <>
                      <Mic className="h-8 w-8 text-muted-foreground" />
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">Record Audio or Upload File</span>
                        <span className="text-xs text-muted-foreground">MP3, WAV files up to 10MB</span>
                      </div>
                      <Button className="mt-2">Start Recording</Button>
                    </>
                  ) : (
                    <>
                      <Video className="h-8 w-8 text-muted-foreground" />
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">Record Video or Upload File</span>
                        <span className="text-xs text-muted-foreground">MP4, WebM files up to 50MB</span>
                      </div>
                      <Button className="mt-2">Start Recording</Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPostDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success("Your post has been created!");
              setIsNewPostDialogOpen(false);
            }}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
