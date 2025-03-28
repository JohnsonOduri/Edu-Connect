import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { database } from "@/firebase";
import { toast } from "sonner";
import { Assignment } from "../types/assignment-types";

export const useCourseData = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([]);
  const [courseAttendance, setCourseAttendance] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const enrollmentsRef = query(
          ref(database, 'enrollments'),
          orderByChild('student_id'),
          equalTo(user.id)
        );
        
        const enrollmentsSnapshot = await get(enrollmentsRef);
        
        const enrollmentData: any[] = [];
        
        if (enrollmentsSnapshot.exists()) {
          enrollmentsSnapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            enrollmentData.push({
              id: childSnapshot.key,
              ...data
            });
          });
        }
        
        const enrollmentsWithCourses = await Promise.all(
          enrollmentData.map(async (enrollment) => {
            const courseRef = ref(database, `courses/${enrollment.course_id}`);
            const courseSnapshot = await get(courseRef);
            
            if (courseSnapshot.exists()) {
              const courseData = courseSnapshot.val();
              let instructorName = "Unknown Instructor";
              if (courseData.instructor_id) {
                const instructorRef = ref(database, `users/${courseData.instructor_id}`);
                const instructorSnapshot = await get(instructorRef);
                if (instructorSnapshot.exists()) {
                  instructorName = instructorSnapshot.val().name || "Unknown Instructor";
                }
              }
              
              return {
                ...enrollment,
                course: {
                  id: enrollment.course_id,
                  ...courseData,
                  instructor_name: instructorName
                }
              };
            }
            return enrollment;
          })
        );
        
        setEnrollments(enrollmentsWithCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  const loadCourseDetails = async (enrollment: any) => {
    setSelectedCourse(enrollment);
    
    try {
      const assignmentsRef = query(
        ref(database, 'assignments'),
        orderByChild('course_id'),
        equalTo(enrollment.course.id)
      );
      
      const assignmentsSnapshot = await get(assignmentsRef);
      const assignmentsData: any[] = [];
      
      if (assignmentsSnapshot.exists()) {
        assignmentsSnapshot.forEach((childSnapshot) => {
          assignmentsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      const submissionsRef = query(
        ref(database, 'submissions'),
        orderByChild('user_id'),
        equalTo(user?.id)
      );
      
      const submissionsSnapshot = await get(submissionsRef);
      const submissions: any[] = [];
      
      if (submissionsSnapshot.exists()) {
        submissionsSnapshot.forEach((childSnapshot) => {
          submissions.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      const assignmentsWithSubmissions = assignmentsData.map(assignment => {
        const submission = submissions.find(s => s.assignment_id === assignment.id);
        return {
          ...assignment,
          submitted: !!submission,
          submission: submission || null
        };
      });
      
      setCourseAssignments(assignmentsWithSubmissions);
      
      const attendanceRef = query(
        ref(database, 'attendance'),
        orderByChild('student_id'),
        equalTo(user?.id)
      );
      
      const attendanceSnapshot = await get(attendanceRef);
      const attendanceData: any[] = [];
      
      if (attendanceSnapshot.exists()) {
        attendanceSnapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data.course_id === enrollment.course.id) {
            attendanceData.push({
              id: childSnapshot.key,
              ...data
            });
          }
        });
      }
      
      setCourseAttendance(attendanceData);
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Failed to load course details");
    }
  };

  const updateAssignment = (updatedAssignmentOrArray: Assignment | Assignment[]) => {
    if (Array.isArray(updatedAssignmentOrArray)) {
      setCourseAssignments(updatedAssignmentOrArray);
    } else {
      setCourseAssignments(prevAssignments => 
        prevAssignments.map(a => a.id === updatedAssignmentOrArray.id ? updatedAssignmentOrArray : a)
      );
    }
  };

  return {
    enrollments,
    isLoading,
    selectedCourse,
    courseAssignments,
    courseAttendance,
    loadCourseDetails,
    setSelectedCourse,
    updateAssignment
  };
};
