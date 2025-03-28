
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ref, set, push } from "firebase/database";
import { database } from "@/firebase";

interface CourseFormProps {
  userId: string;
  userName?: string;
}

export const CourseForm: React.FC<CourseFormProps> = ({ userId, userName }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [prerequisites, setPrerequisites] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Course title is required");
      return;
    }
    
    if (!userId) {
      toast.error("You must be logged in to create a course");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use Firebase's push() to generate a unique ID
      const courseRef = push(ref(database, 'courses'));
      const courseId = courseRef.key;
      
      if (!courseId) {
        throw new Error("Failed to generate a unique course ID");
      }
      
      // Prepare prerequisites as an array
      const prerequisitesArray = prerequisites
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
      
      // Generate a unique access code for this course
      const accessCode = generateUniqueCode();
      
      // Save the course to Firebase
      await set(courseRef, {
        title,
        description,
        category,
        prerequisites: prerequisitesArray,
        instructor_id: userId,
        instructor_name: userName || 'Unknown Teacher',
        access_code: accessCode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false
      });
      
      // Also create an access code entry in the access_codes collection
      const codeRef = push(ref(database, 'access_codes'));
      await set(codeRef, {
        code: accessCode,
        teacher_id: userId,
        course_id: courseId,
        created_at: new Date().toISOString(),
        is_active: true
      });
      
      toast.success("Course created successfully with access code: " + accessCode);
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("General");
      setPrerequisites("");
      
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(error.message || "Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a unique 6-character code
  const generateUniqueCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Create New Course</h3>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              placeholder="Enter course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter course description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g. Mathematics, Programming, Science"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prerequisites">
              Prerequisites (comma-separated)
            </Label>
            <Input
              id="prerequisites"
              placeholder="e.g. Basic Algebra, Python Basics"
              value={prerequisites}
              onChange={(e) => setPrerequisites(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
