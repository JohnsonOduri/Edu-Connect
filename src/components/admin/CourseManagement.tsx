import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Course, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Trash, Pencil, Plus, BookOpen, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ref, set, get, remove, update, query, orderByChild, equalTo } from "firebase/database";
import { database } from "@/firebase";

export const CourseManagement = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    instructor_id: "",
    category: "general",
    prerequisites: [],
    is_archived: false
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch courses
        const coursesRef = ref(database, 'courses');
        const coursesSnapshot = await get(coursesRef);
        
        const coursesData: Course[] = [];
        if (coursesSnapshot.exists()) {
          coursesSnapshot.forEach((childSnapshot) => {
            const courseData = childSnapshot.val();
            coursesData.push({
              id: childSnapshot.key,
              title: courseData.title,
              description: courseData.description,
              instructor_id: courseData.instructor_id,
              category: courseData.category,
              prerequisites: courseData.prerequisites || [],
              is_archived: courseData.is_archived || false,
              created_at: courseData.created_at,
              updated_at: courseData.updated_at
            });
          });
        }
        setCourses(coursesData);
        
        // Fetch instructors (users with teacher role)
        const teachersRef = query(
          ref(database, 'users'),
          orderByChild('role'),
          equalTo('teacher')
        );
        
        const teachersSnapshot = await get(teachersRef);
        
        const teachersData: User[] = [];
        if (teachersSnapshot.exists()) {
          teachersSnapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            teachersData.push({
              id: childSnapshot.key,
              name: userData.name,
              email: userData.email,
              role: userData.role as User['role'],
              avatar: userData.avatar || ''
            });
          });
        }
        setInstructors(teachersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredCourses = courses?.filter(course => 
    course.title.toLowerCase().includes(search.toLowerCase()) || 
    course.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getInstructorName = (id: string) => {
    const instructor = instructors?.find(i => i.id === id);
    return instructor?.name || "Unknown Instructor";
  };

  const handleAddCourse = async () => {
    try {
      // Generate unique ID
      const courseId = `course_${Date.now()}`;
      
      // Save to Firebase
      await set(ref(database, `courses/${courseId}`), {
        title: newCourse.title,
        description: newCourse.description,
        instructor_id: newCourse.instructor_id,
        category: newCourse.category,
        prerequisites: newCourse.prerequisites || [],
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      toast.success("Course created successfully");
      setIsAddCourseOpen(false);
      
      // Add to local state
      setCourses(prev => [...prev, {
        id: courseId,
        title: newCourse.title!,
        description: newCourse.description,
        instructor_id: newCourse.instructor_id!,
        category: newCourse.category,
        prerequisites: newCourse.prerequisites || [],
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      
      // Reset form
      setNewCourse({
        title: "",
        description: "",
        instructor_id: "",
        category: "general",
        prerequisites: [],
        is_archived: false
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create course");
      console.error("Create course error:", error);
    }
  };

  const handleEditCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      // Update in Firebase
      await update(ref(database, `courses/${selectedCourse.id}`), {
        title: selectedCourse.title,
        description: selectedCourse.description,
        instructor_id: selectedCourse.instructor_id,
        category: selectedCourse.category,
        prerequisites: selectedCourse.prerequisites || [],
        is_archived: selectedCourse.is_archived,
        updated_at: new Date().toISOString()
      });
      
      toast.success("Course updated successfully");
      setIsEditCourseOpen(false);
      
      // Update in local state
      setCourses(prev => prev.map(course => 
        course.id === selectedCourse.id ? selectedCourse : course
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to update course");
      console.error("Update course error:", error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      // Delete from Firebase
      await remove(ref(database, `courses/${selectedCourse.id}`));
      
      toast.success("Course deleted successfully");
      setIsDeleteCourseOpen(false);
      
      // Remove from local state
      setCourses(prev => prev.filter(course => course.id !== selectedCourse.id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete course");
      console.error("Delete course error:", error);
    }
  };

  const handleArchiveCourse = async (course: Course, archive: boolean) => {
    try {
      // Update in Firebase
      await update(ref(database, `courses/${course.id}`), {
        is_archived: archive,
        updated_at: new Date().toISOString()
      });
      
      toast.success(`Course ${archive ? 'archived' : 'unarchived'} successfully`);
      
      // Update in local state
      setCourses(prev => prev.map(c => 
        c.id === course.id ? {...c, is_archived: archive} : c
      ));
    } catch (error: any) {
      toast.error(error.message || `Failed to ${archive ? 'archive' : 'unarchive'} course`);
      console.error("Archive course error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Course Management</h2>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setIsAddCourseOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses?.map(course => (
            <Card key={course.id} className={`overflow-hidden ${course.is_archived ? 'opacity-70' : ''}`}>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant={course.is_archived ? "secondary" : "default"} className="mb-2">
                      {course.is_archived ? "Archived" : "Active"}
                    </Badge>
                    {course.category && (
                      <Badge variant="outline" className="mb-2">
                        {course.category}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{getInstructorName(course.instructor_id)}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {course.description || "No description available"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.prerequisites?.map((prereq, index) => (
                      <Badge key={index} variant="outline" className="bg-background">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0 border-t mt-4">
                <div className="flex gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsEditCourseOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsDeleteCourseOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchiveCourse(course, !course.is_archived)}
                >
                  {course.is_archived ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Archive
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Course Dialog */}
      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                placeholder="Enter course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Enter course description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Select 
                value={newCourse.instructor_id} 
                onValueChange={(value) => setNewCourse({...newCourse, instructor_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors?.map(instructor => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newCourse.category}
                onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                placeholder="Enter course category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites (comma-separated)</Label>
              <Input
                id="prerequisites"
                value={newCourse.prerequisites?.join(", ")}
                onChange={(e) => setNewCourse({
                  ...newCourse, 
                  prerequisites: e.target.value.split(",").map(p => p.trim()).filter(Boolean)
                })}
                placeholder="e.g. Intro to Programming, Mathematics 101"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={selectedCourse.title}
                  onChange={(e) => setSelectedCourse({...selectedCourse, title: e.target.value})}
                  placeholder="Enter course title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedCourse.description}
                  onChange={(e) => setSelectedCourse({...selectedCourse, description: e.target.value})}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructor">Instructor</Label>
                <Select 
                  value={selectedCourse.instructor_id} 
                  onValueChange={(value) => setSelectedCourse({...selectedCourse, instructor_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors?.map(instructor => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={selectedCourse.category}
                  onChange={(e) => setSelectedCourse({...selectedCourse, category: e.target.value})}
                  placeholder="Enter course category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prerequisites">Prerequisites (comma-separated)</Label>
                <Input
                  id="edit-prerequisites"
                  value={selectedCourse.prerequisites?.join(", ")}
                  onChange={(e) => setSelectedCourse({
                    ...selectedCourse, 
                    prerequisites: e.target.value.split(",").map(p => p.trim()).filter(Boolean)
                  })}
                  placeholder="e.g. Intro to Programming, Mathematics 101"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCourseOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCourse}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteCourseOpen} onOpenChange={setIsDeleteCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{selectedCourse?.title}"?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone. All course data will be permanently removed.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCourseOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>Delete Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
