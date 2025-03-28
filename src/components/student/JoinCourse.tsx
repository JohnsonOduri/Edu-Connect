
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ref, get, push, set, query, orderByChild, equalTo } from "firebase/database";
import { database } from "@/firebase";
import { Key } from "lucide-react";

interface JoinCourseProps {
  onJoinSuccess?: () => void;
}

export const JoinCourse: React.FC<JoinCourseProps> = ({ onJoinSuccess }) => {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast.error("Please enter an access code");
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to join a course");
      return;
    }
    
    setLoading(true);
    
    try {
      // First check in access_codes collection
      const accessCodesRef = query(
        ref(database, 'access_codes'),
        orderByChild('code'),
        equalTo(accessCode.trim().toUpperCase())
      );
      
      const accessCodesSnapshot = await get(accessCodesRef);
      
      let courseId = null;
      
      if (accessCodesSnapshot.exists()) {
        // Get the course ID from the access code
        accessCodesSnapshot.forEach((childSnapshot) => {
          const codeData = childSnapshot.val();
          courseId = codeData.course_id;
        });
      } else {
        try {
          // If not found in access_codes, try to find all courses and filter locally
          // This avoids the indexing issue with direct queries
          const coursesRef = ref(database, 'courses');
          const coursesSnapshot = await get(coursesRef);
          
          if (coursesSnapshot.exists()) {
            coursesSnapshot.forEach((childSnapshot) => {
              const course = childSnapshot.val();
              if (course.access_code === accessCode.trim().toUpperCase()) {
                courseId = childSnapshot.key;
              }
            });
          }
        } catch (error) {
          console.error("Error searching for courses:", error);
        }
      }
      
      if (!courseId) {
        toast.error("Invalid access code. Please check and try again.");
        setLoading(false);
        return;
      }
      
      // Get the course data
      const courseRef = ref(database, `courses/${courseId}`);
      const courseSnapshot = await get(courseRef);
      
      if (!courseSnapshot.exists()) {
        toast.error("Error finding course");
        setLoading(false);
        return;
      }
      
      const courseData = courseSnapshot.val();
      
      // Check if already enrolled
      const enrollmentsRef = query(
        ref(database, 'enrollments'),
        orderByChild('student_id'),
        equalTo(user.id)
      );
      
      const enrollmentsSnapshot = await get(enrollmentsRef);
      
      let alreadyEnrolled = false;
      
      if (enrollmentsSnapshot.exists()) {
        enrollmentsSnapshot.forEach((childSnapshot) => {
          const enrollment = childSnapshot.val();
          if (enrollment.course_id === courseId) {
            alreadyEnrolled = true;
          }
        });
      }
      
      if (alreadyEnrolled) {
        toast.info("You are already enrolled in this course");
        setLoading(false);
        return;
      }
      
      // Create the enrollment
      const enrollmentRef = push(ref(database, 'enrollments'));
      await set(enrollmentRef, {
        course_id: courseId,
        student_id: user.id,
        student_name: user.name || 'Unknown Student',
        enrolled_at: new Date().toISOString(),
        completed: false,
        progress: 0
      });
      
      toast.success(`Successfully enrolled in ${courseData.title}`);
      setAccessCode("");
      
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (error) {
      console.error("Error joining course:", error);
      toast.error("Failed to join course");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join a Course</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoinCourse} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-code">Course Access Code</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="access-code"
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="pl-9 font-mono uppercase"
                  maxLength={6}
                />
              </div>
              <Button type="submit" disabled={loading || !accessCode.trim()}>
                {loading ? "Joining..." : "Join Course"}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Ask your teacher for the access code to join their course. 
            The code is case-insensitive.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
