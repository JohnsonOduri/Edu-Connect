
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Assignment } from "./types/assignment-types";
import { fetchStudentAssignments } from "./utils/assignment-utils";
import { AssignmentList } from "./AssignmentList";

export const MyAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const assignmentsData = await fetchStudentAssignments(user.id);
        setAssignments(assignmentsData);
        
        if (assignmentsData.length === 0) {
          toast.info("No assignments found", {
            description: "You don't have any assignments assigned to you yet."
          });
        } else {
          // Check for assignments due soon
          const upcomingAssignments = assignmentsData.filter(a => {
            if (!a.due_date || a.submitted) return false;
            const dueDate = new Date(a.due_date);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 3;
          });
          
          if (upcomingAssignments.length > 0) {
            toast.warning(`${upcomingAssignments.length} assignment${upcomingAssignments.length > 1 ? 's' : ''} due soon`, {
              description: "Don't forget to submit your assignments before the deadline."
            });
          }
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast.error("Failed to load your assignments");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAssignments();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AssignmentList assignments={assignments} setAssignments={setAssignments} />;
};
