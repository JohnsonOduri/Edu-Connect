
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Key, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, get, query, orderByChild, equalTo, set } from "firebase/database";
import { database } from "@/firebase";

interface JoinCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinCourseDialog: React.FC<JoinCourseDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [accessCode, setAccessCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useAuth();

  const handleJoinWithCode = async () => {
    if (!accessCode.trim()) {
      toast.error("Please enter an access code");
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to enroll in a course");
      return;
    }
    
    setIsJoining(true);
    
    try {
      // First check in access_codes collection
      const accessCodesRef = query(
        ref(database, 'access_codes'),
        orderByChild('code'),
        equalTo(accessCode.trim().toUpperCase())
      );
      
      const accessCodesSnapshot = await get(accessCodesRef);
      
      let courseId = null;
      let courseData = null;
      
      if (accessCodesSnapshot.exists()) {
        // Get the course ID from the access code
        accessCodesSnapshot.forEach((childSnapshot) => {
          const codeData = childSnapshot.val();
          courseId = codeData.course_id;
        });
        
        // If we found an access code, get the course data
        if (courseId) {
          const courseRef = ref(database, `courses/${courseId}`);
          const courseSnapshot = await get(courseRef);
          
          if (courseSnapshot.exists()) {
            courseData = courseSnapshot.val();
          }
        }
      } else {
        try {
          // If not found in access_codes, get all courses and filter locally
          // This avoids the indexing issue
          const coursesRef = ref(database, 'courses');
          const coursesSnapshot = await get(coursesRef);
          
          if (coursesSnapshot.exists()) {
            coursesSnapshot.forEach((childSnapshot) => {
              const course = childSnapshot.val();
              if (course.access_code === accessCode.trim().toUpperCase()) {
                courseId = childSnapshot.key;
                courseData = course;
              }
            });
          }
        } catch (error) {
          console.error("Error searching for courses:", error);
        }
      }
      
      if (!courseId || !courseData) {
        toast.error("Invalid access code. Please check and try again.");
        setIsJoining(false);
        return;
      }
      
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
        setIsJoining(false);
        return;
      }
      
      // Create the enrollment
      const enrollmentRef = ref(database, `enrollments/enrollment_${Date.now()}`);
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
      onOpenChange(false);
      
      // Refresh enrollments
      window.location.reload();
    } catch (error) {
      console.error("Error joining course:", error);
      toast.error("Failed to join course");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Course</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter the access code provided by your teacher to join their course.
          </p>
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
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleJoinWithCode} disabled={isJoining || !accessCode.trim()}>
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Course'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
