
import React from "react";
import { FileImage, AlignLeft } from "lucide-react";
import { formatAssignmentContentForStudent } from "../utils/assignment-utils";
import { Assignment } from "../types/assignment-types";

interface AssignmentContentProps {
  assignment: Assignment;
  preview?: boolean;
}

export const AssignmentContent: React.FC<AssignmentContentProps> = ({ 
  assignment, 
  preview = false 
}) => {
  const formattedContent = formatAssignmentContentForStudent(assignment);
  
  return (
    <>
      {assignment.fileURL && (
        <div className="mb-4">
          <a 
            href={assignment.fileURL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-primary flex items-center hover:underline"
          >
            <FileImage className="h-4 w-4 mr-1" />
            View Assignment File
          </a>
        </div>
      )}
      
      {(assignment.assignmentType === "text" || assignment.textContent) && (
        <div className="mb-4">
          <p className="text-sm flex items-center text-primary mb-2">
            <AlignLeft className="h-4 w-4 mr-1" />
            Assignment Content:
          </p>
          <div className="text-sm bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
            {preview 
              ? `${formattedContent.substring(0, 150)}${formattedContent.length > 150 ? '...' : ''}`
              : formattedContent
            }
          </div>
        </div>
      )}
    </>
  );
};
