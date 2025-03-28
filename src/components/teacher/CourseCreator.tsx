
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CourseList } from "./CourseList";
import { CourseForm } from "./CourseForm";
import { ref, onValue } from "firebase/database";
import { database } from "@/firebase";

interface CourseCreatorProps {
  onCourseSelect: (courseId: string) => void;
}

export const CourseCreator: React.FC<CourseCreatorProps> = ({ onCourseSelect }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    
    // Fetch existing courses created by this teacher
    const coursesRef = ref(database, 'courses');
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      if (!snapshot.exists()) return;
      
      const coursesData: any[] = [];
      snapshot.forEach((childSnapshot) => {
        const courseData = childSnapshot.val();
        if (courseData.instructor_id === user.id) {
          coursesData.push({
            id: childSnapshot.key,
            ...courseData
          });
        }
      });
      
      setCourses(coursesData);
    });
    
    return () => unsubscribe();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Management</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Your Courses</h3>
          <CourseList courses={courses} onCourseSelect={onCourseSelect} />
        </div>
        
        <div>
          <CourseForm 
            userId={user?.id || ''} 
            userName={user?.name || undefined} 
          />
        </div>
      </div>
    </div>
  );
};
