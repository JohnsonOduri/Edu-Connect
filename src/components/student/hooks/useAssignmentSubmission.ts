
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Assignment } from "../types/assignment-types";
import { database } from "@/firebase";
import { ref, push, set } from "firebase/database";
import { toast } from "sonner";

export const useAssignmentSubmission = (
  assignment: Assignment,
  onSubmitSuccess: (updatedAssignment: Assignment) => void
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAssignment = async (submissionText: string, fileURL: string | null) => {
    if (!user) {
      toast.error("You must be logged in to submit an assignment");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a reference for the new submission
      const submissionRef = push(ref(database, "submissions"));
      
      const submissionData = {
        assignment_id: assignment.id,
        user_id: user.id,
        student_name: user.name,
        content: submissionText,
        file_url: fileURL,
        submitted_at: new Date().toISOString(),
        course_id: assignment.course_id,
        course_name: assignment.course_name,
        teacher_id: assignment.teacher_id,
        assignment_title: assignment.title,
        grade: null,
        feedback: null
      };
      
      await set(submissionRef, submissionData);
      toast.success("Assignment submitted successfully");
      
      // Create an updated assignment with submission data for the parent component
      const updatedAssignment = {
        ...assignment,
        submitted: true,
        submission: {
          id: submissionRef.key!,
          ...submissionData
        }
      };
      
      onSubmitSuccess(updatedAssignment);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPastDue = () => {
    if (!assignment.due_date) return false;
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    return now > dueDate;
  };

  return {
    isSubmitting,
    submitAssignment,
    isPastDue: isPastDue()
  };
};
