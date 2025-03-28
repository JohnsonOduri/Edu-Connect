import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Key, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ref, push, set, get, query, orderByChild, equalTo, onValue } from "firebase/database";
import { database } from "@/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const generateRandomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

interface AccessCodeManagerProps {
  courseId?: string;
  courseCode?: string;
}

export const AccessCodeManager: React.FC<AccessCodeManagerProps> = ({ courseId: initialCourseId, courseCode }) => {
  const { user } = useAuth();
  const [codes, setCodes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId || "");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    // Fetch courses created by this teacher
    const coursesRef = ref(database, 'courses');
    const coursesQuery = query(
      coursesRef,
      orderByChild('instructor_id'),
      equalTo(user.id)
    );
    
    const coursesUnsubscribe = onValue(coursesQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setCourses([]);
        return;
      }
      
      const coursesData: any[] = [];
      snapshot.forEach((childSnapshot) => {
        const courseData = childSnapshot.val();
        if (!courseData.is_archived) {
          coursesData.push({
            id: childSnapshot.key,
            ...courseData
          });
        }
      });
      
      setCourses(coursesData);
      
      // Auto-select first course if none selected
      if (coursesData.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesData[0].id);
      }
    });
    
    // Fetch access codes for this teacher
    const codesRef = ref(database, 'access_codes');
    const codesQuery = query(
      codesRef,
      orderByChild('teacher_id'),
      equalTo(user.id)
    );
    
    const codesUnsubscribe = onValue(codesQuery, (snapshot) => {
      setIsLoading(false);
      
      if (!snapshot.exists()) {
        setCodes([]);
        return;
      }
      
      const codesData: any[] = [];
      snapshot.forEach((childSnapshot) => {
        codesData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      setCodes(codesData);
    });
    
    return () => {
      coursesUnsubscribe();
      codesUnsubscribe();
    };
  }, [user?.id, selectedCourse]);

  const handleGenerateCode = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to generate an access code");
      return;
    }
    
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Check course exists
      const courseRef = ref(database, `courses/${selectedCourse}`);
      const courseSnapshot = await get(courseRef);
      
      if (!courseSnapshot.exists()) {
        toast.error("Selected course does not exist");
        return;
      }
      
      // Generate a new code and ensure it's unique
      let newCode = generateRandomCode();
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 5) {
        const codeQuery = query(
          ref(database, 'access_codes'),
          orderByChild('code'),
          equalTo(newCode)
        );
        
        const codeSnapshot = await get(codeQuery);
        isUnique = !codeSnapshot.exists();
        
        if (!isUnique) {
          newCode = generateRandomCode();
        }
        
        attempts++;
      }
      
      if (!isUnique) {
        toast.error("Failed to generate a unique code. Please try again.");
        return;
      }
      
      // Create the access code
      const codeRef = push(ref(database, 'access_codes'));
      await set(codeRef, {
        code: newCode,
        teacher_id: user.id,
        course_id: selectedCourse,
        created_at: new Date().toISOString(),
        is_active: true
      });
      
      toast.success("Access code generated successfully");
    } catch (error) {
      console.error("Error generating access code:", error);
      toast.error("Failed to generate access code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Access code copied to clipboard");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Access Codes</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Access Codes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Generate access codes for your students to join your courses.
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-select">Select Course</Label>
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
            >
              <SelectTrigger id="course-select">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.length === 0 ? (
                  <SelectItem value="no-courses" disabled>
                    No courses available
                  </SelectItem>
                ) : (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerateCode} 
            className="w-full"
            disabled={isGenerating || courses.length === 0 || !selectedCourse}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Code
              </>
            )}
          </Button>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium mb-3">Your Access Codes</h3>
          
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No access codes generated yet.
            </p>
          ) : (
            <div className="space-y-2">
              {codes.map((code: any) => {
                const course = courses.find(c => c.id === code.course_id);
                return (
                  <div key={code.id} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                    <div className="flex items-center">
                      <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <span className="font-mono font-medium">{code.code}</span>
                        {course && (
                          <p className="text-xs text-muted-foreground">
                            {course.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleCopyCode(code.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
