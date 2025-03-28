
import { database } from "@/firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { Assignment } from "../types/assignment-types";

export const fetchStudentAssignments = async (studentId: string): Promise<Assignment[]> => {
  try {
    // 1. First get the courses this student is enrolled in
    const enrollmentsRef = query(
      ref(database, 'enrollments'),
      orderByChild('user_id'),
      equalTo(studentId)
    );
    
    const enrollmentsSnapshot = await get(enrollmentsRef);
    
    if (!enrollmentsSnapshot.exists()) {
      console.log('No enrollments found for student');
      return [];
    }
    
    // Get course IDs
    const courseIds: string[] = [];
    enrollmentsSnapshot.forEach((childSnapshot) => {
      const enrollment = childSnapshot.val();
      courseIds.push(enrollment.course_id);
    });
    
    if (courseIds.length === 0) {
      console.log('No course IDs found');
      return [];
    }
    
    console.log('Course IDs:', courseIds);
    
    // 2. Get all assignments
    const assignmentsRef = ref(database, 'assignments');
    const assignmentsSnapshot = await get(assignmentsRef);
    
    if (!assignmentsSnapshot.exists()) {
      console.log('No assignments found');
      return [];
    }
    
    // 3. Filter assignments for the student's courses
    const assignmentsArray: Assignment[] = [];
    
    assignmentsSnapshot.forEach((childSnapshot) => {
      const assignment = childSnapshot.val();
      
      // Only add assignments for courses the student is enrolled in
      if (courseIds.includes(assignment.course_id)) {
        // Normalize the structure
        assignmentsArray.push({
          id: childSnapshot.key as string,
          title: assignment.title,
          description: assignment.description || '',
          course_id: assignment.course_id,
          course_name: assignment.course_name || '',
          due_date: assignment.due_date,
          points: assignment.points || 10,
          teacher_id: assignment.teacher_id,
          assignmentType: assignment.assignmentType || 'text',
          textContent: assignment.textContent || assignment.description || '',
          fileURL: assignment.file_url || assignment.fileURL || null,
          aiGeneratedContent: assignment.aiGeneratedContent || null,
          submitted: false // Will be updated later
        });
      }
    });
    
    console.log('Filtered assignments:', assignmentsArray);
    
    // 4. Check if the student has submitted any of these assignments
    const submissionsRef = query(
      ref(database, 'submissions'),
      orderByChild('user_id'),
      equalTo(studentId)
    );
    
    const submissionsSnapshot = await get(submissionsRef);
    
    if (submissionsSnapshot.exists()) {
      const submissions: {[key: string]: any} = {};
      
      submissionsSnapshot.forEach((childSnapshot) => {
        const submission = childSnapshot.val();
        submissions[submission.assignment_id] = {
          id: childSnapshot.key,
          ...submission
        };
      });
      
      // Update assignment objects with submission data
      assignmentsArray.forEach((assignment) => {
        if (submissions[assignment.id]) {
          assignment.submitted = true;
          assignment.submission = submissions[assignment.id];
        }
      });
    }
    
    console.log('Final assignments with submission status:', assignmentsArray);
    
    // 5. Sort assignments by due date (nearest first)
    return assignmentsArray.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
    
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
};

// New function to display the assignment description including textContent for students
export const formatAssignmentContentForStudent = (assignment: Assignment): string => {
  let content = assignment.description || '';
  
  // If there's textContent and it's different from the description, append it
  if (assignment.textContent && assignment.textContent !== assignment.description) {
    content += '\n\n' + assignment.textContent;
  }
  
  return content;
};

export const fetchAssignmentDetails = async (assignmentId: string) => {
  const assignmentRef = ref(database, `assignments/${assignmentId}`);
  const snapshot = await get(assignmentRef);

  if (snapshot.exists()) {
    return snapshot.val(); // Includes textContent and aiGeneratedContent
  } else {
    throw new Error("Assignment not found");
  }
};
