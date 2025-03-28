
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Assignment } from "../types/assignment-types";

interface SubmissionViewProps {
  assignment: Assignment;
}

export const SubmissionView: React.FC<SubmissionViewProps> = ({ assignment }) => {
  if (!assignment.submitted || !assignment.submission) {
    return null;
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your Submission</h3>
        <Badge variant="outline">
          Submitted: {formatDate(assignment.submission.submitted_at)}
        </Badge>
      </div>
      
      {assignment.submission.content && (
        <div className="mb-4">
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">
            {assignment.submission.content}
          </div>
        </div>
      )}
      
      {assignment.submission.file_url && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Submitted File</h4>
          <a 
            href={assignment.submission.file_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline"
          >
            View your submission file
          </a>
        </div>
      )}
      
      {assignment.submission.grade !== null && assignment.submission.grade !== undefined && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Grade</h4>
            <Badge variant="outline" className="text-green-600 bg-green-50">
              {assignment.submission.grade} / {assignment.points}
            </Badge>
          </div>
          
          {assignment.submission.feedback && (
            <div className="mt-2">
              <h4 className="font-medium mb-1">Feedback</h4>
              <p className="text-sm">{assignment.submission.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
