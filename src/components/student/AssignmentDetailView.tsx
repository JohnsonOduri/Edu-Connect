
import React, { useEffect } from "react";
import { Assignment } from "./types/assignment-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatAssignmentContentForStudent } from "./utils/assignment-utils";
import { useAssignmentSubmission } from "./hooks/useAssignmentSubmission";
import { SubmissionForm } from "./ui/SubmissionForm";
import { SubmissionView } from "./ui/SubmissionView";

interface Props {
  assignment: Assignment;
  onBack: () => void;
  onSubmit: (updatedAssignment: Assignment) => void;
}

export const AssignmentDetailView = ({ assignment, onBack, onSubmit }: Props) => {
  const { isSubmitting, submitAssignment, isPastDue } = useAssignmentSubmission(assignment, onSubmit);
  
  const handleSubmission = async (submissionText: string, fileURL: string | null) => {
    await submitAssignment(submissionText, fileURL);
  };

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <p className="text-muted-foreground">{assignment.course_name}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {assignment.due_date && (
            <Badge variant={isPastDue ? "destructive" : "outline"}>
              Due: {formatDate(assignment.due_date)}
            </Badge>
          )}
          <Badge variant="secondary">{assignment.points} points</Badge>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-3">Assignment Description</h3>
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md mb-4">
            {formatAssignmentContentForStudent(assignment)}
          </div>
          
          {assignment.aiGeneratedContent && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-3">AI-Generated Content</h3>
              <div className="whitespace-pre-wrap bg-blue-50 dark:bg-blue-900/10 p-4 rounded-md mb-4 border border-blue-200 dark:border-blue-800">
                {assignment.aiGeneratedContent}
              </div>
            </div>
          )}
          
          {assignment.fileURL && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Assignment Files</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={assignment.fileURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View attachment
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {assignment.submitted && assignment.submission ? (
        <Card>
          <CardContent className="pt-6">
            <SubmissionView assignment={assignment} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <SubmissionForm 
              isPastDue={isPastDue} 
              onSubmit={handleSubmission}
              onCancel={onBack}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
