
import React from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Search, 
  Clock, 
  Calendar,
  FileText,
  Video,
  Link as LinkIcon,
  ChevronRight,
  Download,
  Play
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock course data
const COURSES = [
  {
    id: "1",
    title: "Introduction to Physics",
    description: "A foundational course covering basic principles of physics including mechanics, thermodynamics, and waves.",
    instructor: "Dr. Albert Schmidt",
    department: "Science",
    startDate: "2023-01-15",
    endDate: "2023-05-30",
    progress: 75,
    image: "https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?auto=format&fit=crop&q=80&w=2370",
    materials: [
      { id: "m1", title: "Course Syllabus", type: "pdf", url: "#", dateAdded: "2023-01-15" },
      { id: "m2", title: "Introduction to Mechanics", type: "video", url: "#", dateAdded: "2023-01-20" },
      { id: "m3", title: "Newton's Laws Explained", type: "pdf", url: "#", dateAdded: "2023-01-25" },
      { id: "m4", title: "Thermodynamics Basics", type: "pdf", url: "#", dateAdded: "2023-02-10" },
      { id: "m5", title: "Wave Motion Demo", type: "video", url: "#", dateAdded: "2023-02-15" },
    ],
    schedule: [
      { day: "Monday", time: "10:00 AM - 11:30 AM", location: "Science Hall 101" },
      { day: "Wednesday", time: "10:00 AM - 11:30 AM", location: "Science Hall 101" },
    ]
  },
  {
    id: "2",
    title: "World Literature",
    description: "Explore masterpieces of literature from different cultures and time periods around the world.",
    instructor: "Prof. Emily Johnson",
    department: "Humanities",
    startDate: "2023-01-16",
    endDate: "2023-05-31",
    progress: 60,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=2374",
    materials: [
      { id: "m6", title: "Course Overview", type: "pdf", url: "#", dateAdded: "2023-01-16" },
      { id: "m7", title: "Ancient Literature Guide", type: "pdf", url: "#", dateAdded: "2023-01-23" },
      { id: "m8", title: "Classical Poetry Analysis", type: "link", url: "#", dateAdded: "2023-02-01" },
      { id: "m9", title: "Modern Authors Lecture", type: "video", url: "#", dateAdded: "2023-02-08" },
    ],
    schedule: [
      { day: "Tuesday", time: "1:00 PM - 2:30 PM", location: "Humanities Building 205" },
      { day: "Thursday", time: "1:00 PM - 2:30 PM", location: "Humanities Building 205" },
    ]
  },
  {
    id: "3",
    title: "Advanced Mathematics",
    description: "In-depth study of calculus, differential equations, and their applications in various fields.",
    instructor: "Dr. Robert Chen",
    department: "Mathematics",
    startDate: "2023-01-17",
    endDate: "2023-06-01",
    progress: 40,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2370",
    materials: [
      { id: "m10", title: "Course Introduction", type: "pdf", url: "#", dateAdded: "2023-01-17" },
      { id: "m11", title: "Calculus Review", type: "pdf", url: "#", dateAdded: "2023-01-24" },
      { id: "m12", title: "Differential Equations Guide", type: "pdf", url: "#", dateAdded: "2023-01-31" },
      { id: "m13", title: "Applied Mathematics Workshop", type: "video", url: "#", dateAdded: "2023-02-07" },
    ],
    schedule: [
      { day: "Monday", time: "2:00 PM - 3:30 PM", location: "Math & Science Center 302" },
      { day: "Wednesday", time: "2:00 PM - 3:30 PM", location: "Math & Science Center 302" },
      { day: "Friday", time: "2:00 PM - 3:30 PM", location: "Math & Science Center 302" },
    ]
  },
  {
    id: "4",
    title: "History of Art",
    description: "Survey of major art movements and influential artists from ancient civilizations to contemporary periods.",
    instructor: "Prof. Sarah Martinez",
    department: "Fine Arts",
    startDate: "2023-01-18",
    endDate: "2023-06-02",
    progress: 90,
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80&w=2371",
    materials: [
      { id: "m14", title: "Course Overview and Expectations", type: "pdf", url: "#", dateAdded: "2023-01-18" },
      { id: "m15", title: "Ancient Art Analysis", type: "pdf", url: "#", dateAdded: "2023-01-25" },
      { id: "m16", title: "Renaissance Masters", type: "video", url: "#", dateAdded: "2023-02-01" },
      { id: "m17", title: "Modern Art Movements", type: "pdf", url: "#", dateAdded: "2023-02-08" },
      { id: "m18", title: "Contemporary Art Resources", type: "link", url: "#", dateAdded: "2023-02-15" },
    ],
    schedule: [
      { day: "Tuesday", time: "10:00 AM - 11:30 AM", location: "Arts Building 110" },
      { day: "Thursday", time: "10:00 AM - 11:30 AM", location: "Arts Building 110" },
    ]
  }
];

const Courses = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState<typeof COURSES[0] | null>(null);
  const [activeTab, setActiveTab] = React.useState("all");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const filteredCourses = COURSES.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseSelect = (course: typeof COURSES[0]) => {
    setSelectedCourse(course);
  };

  const handleBackToList = () => {
    setSelectedCourse(null);
  };

  const getIconForMaterialType = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          {selectedCourse ? (
            // Course Detail View
            <div className="animate-fadeIn">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList} 
                className="mb-4 -ml-2"
              >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                Back to Courses
              </Button>
              
              <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img 
                  src={selectedCourse.image} 
                  alt={selectedCourse.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 p-6 z-20 text-white">
                  <h1 className="text-2xl md:text-3xl font-bold">{selectedCourse.title}</h1>
                  <p className="text-white/80">Instructor: {selectedCourse.instructor}</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                  <Card className="shadow-subtle">
                    <CardHeader>
                      <CardTitle>Course Overview</CardTitle>
                      <CardDescription>Course details and progress</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-muted-foreground">{selectedCourse.description}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Department</h3>
                        <Badge>{selectedCourse.department}</Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Course Period</h3>
                        <p className="text-muted-foreground">
                          {new Date(selectedCourse.startDate).toLocaleDateString()} - {new Date(selectedCourse.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Progress</h3>
                        <div className="flex items-center gap-2">
                          <Progress value={selectedCourse.progress} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{selectedCourse.progress}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-subtle">
                    <CardHeader>
                      <CardTitle>Course Materials</CardTitle>
                      <CardDescription>Lecture notes, videos, and other resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedCourse.materials.map((material) => (
                          <div 
                            key={material.id} 
                            className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                material.type === 'pdf' 
                                  ? 'bg-blue-500/10 text-blue-500' 
                                  : material.type === 'video' 
                                    ? 'bg-red-500/10 text-red-500' 
                                    : 'bg-green-500/10 text-green-500'
                              }`}>
                                {getIconForMaterialType(material.type)}
                              </div>
                              <div>
                                <div className="font-medium">{material.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  Added on {new Date(material.dateAdded).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button size="icon" variant="ghost">
                              {material.type === 'video' ? (
                                <Play className="h-4 w-4" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card className="shadow-subtle">
                    <CardHeader>
                      <CardTitle>Schedule</CardTitle>
                      <CardDescription>Class times and locations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCourse.schedule.map((session, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{session.day}</div>
                              <div className="text-sm text-muted-foreground">{session.time}</div>
                              <div className="text-xs text-muted-foreground">{session.location}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-subtle">
                    <CardHeader>
                      <CardTitle>Upcoming Deadlines</CardTitle>
                      <CardDescription>Assignments and exams</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No upcoming deadlines</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            // Course List View
            <div className="animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                  <p className="text-muted-foreground">Browse and access your enrolled courses</p>
                </div>
                <div className="w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search courses..." 
                      className="pl-9 w-full md:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Courses</TabsTrigger>
                  <TabsTrigger value="science">Science</TabsTrigger>
                  <TabsTrigger value="humanities">Humanities</TabsTrigger>
                  <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
                  <TabsTrigger value="fine-arts">Fine Arts</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses
                  .filter(course => activeTab === "all" || course.department.toLowerCase() === activeTab)
                  .map((course) => (
                    <Card 
                      key={course.id} 
                      className="overflow-hidden group cursor-pointer shadow-subtle hover:shadow-elevated transition-all"
                      onClick={() => handleCourseSelect(course)}
                    >
                      <div className="relative h-48">
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 z-10">
                          <Badge className="mb-2">{course.department}</Badge>
                          <h2 className="text-xl font-bold text-white">{course.title}</h2>
                          <p className="text-white/80 text-sm">{course.instructor}</p>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm text-muted-foreground">Progress</div>
                          <div className="text-sm font-medium">{course.progress}%</div>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </CardContent>
                      <CardFooter className="border-t bg-card/50 py-3 group-hover:bg-card transition-colors">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {course.materials.length} Materials
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            View Course
                            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
              
              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                  <h2 className="mt-4 text-xl font-medium">No courses found</h2>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
