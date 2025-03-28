
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Assignment } from "../types/assignment-types";

interface AssignmentStatusProps {
  assignment: Assignment;
  className?: string;
}

export const AssignmentStatus: React.FC<AssignmentStatusProps> = ({ 
  assignment,
  className
}) => {
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isPastDue = dueDate ? dueDate < new Date() : false;
  
  if (assignment.submitted) {
    return (
      <Badge className={`bg-green-500 ${className}`}>
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Submitted
      </Badge>
    );
  }
  
  if (isPastDue) {
    return (
      <Badge variant="destructive" className={className}>
        <AlertCircle className="h-3 w-3 mr-1" />
        Past Due
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className={`border-amber-500 text-amber-500 ${className}`}>
      <Clock className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
};
