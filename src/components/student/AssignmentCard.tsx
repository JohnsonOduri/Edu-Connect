
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ref, push, set } from "firebase/database";
import { database } from "@/firebase";
import { Assignment } from "./types/assignment-types";
import { AssignmentStatus } from "./ui/AssignmentStatus";
import { AssignmentContent } from "./ui/AssignmentContent";

interface AssignmentCardProps {
  assignment: Assignment;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

export const AssignmentCard = ({ assignment, setAssignments }: AssignmentCardProps) => {
  const { user } = useAuth();
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isPastDue = dueDate ? dueDate < new Date() : false;
  
  const handleSubmit = async () => {
    setSubmissionError('');
    
    if (!submissionContent.trim()) {
      setSubmissionError("Please enter your response for this assignment");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submissionRef = push(ref(database, 'submissions'));
      
      const submissionData = {
        id: submissionRef.key,
        assignment_id: assignment.id,
        user_id: user.id,
        student_name: user.name,
        content: submissionContent,
        submitted_at: new Date().toISOString(),
        teacher_id: assignment.teacher_id,
        assignment_title: assignment.title,
        points: assignment.points,
        course_id: assignment.course_id
      };
      
      await set(submissionRef, submissionData);
      
      toast.success("Assignment submitted successfully");
      
      setAssignments(prevAssignments => 
        prevAssignments.map(a => 
          a.id === assignment.id 
            ? {...a, submitted: true, submission: submissionData} 
            : a
        )
      );
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{assignment.title}</CardTitle>
          <AssignmentStatus assignment={assignment} />
        </div>
        <p className="text-sm text-muted-foreground">{assignment.course_name}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 line-clamp-2">{assignment.description || 'No description provided.'}</p>
        
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {dueDate ? dueDate.toLocaleDateString() : 'No due date'}
          </div>
          <div>{assignment.points} points</div>
        </div>
        
        <AssignmentContent assignment={assignment} preview={true} />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {assignment.submitted ? (
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                View Submission
              </Button>
            </DialogTrigger>
          ) : (
            <DialogTrigger asChild>
              <Button variant="default" className="w-full" disabled={isPastDue}>
                {isPastDue ? "Past Due Date" : "Start Assignment"}
              </Button>
            </DialogTrigger>
          )}
          
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {assignment.submitted ? "Your Submission" : "Submit Assignment"}
              </DialogTitle>
            </DialogHeader>
            
            {assignment.submitted ? (
              <SubmissionDetails assignment={assignment} />
            ) : (
              <SubmissionDialog 
                assignment={assignment}
                submissionContent={submissionContent}
                setSubmissionContent={setSubmissionContent}
                submissionError={submissionError}
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

interface SubmissionDetailsProps {
  assignment: Assignment;
}

const SubmissionDetails: React.FC<SubmissionDetailsProps> = ({ assignment }) => {
  if (!assignment.submission) return null;
  
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Your Response:</h4>
        <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{assignment.submission.content}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Submitted on:</h4>
        <p className="text-sm">
          {new Date(assignment.submission.submitted_at).toLocaleString()}
        </p>
      </div>
      
      {assignment.submission.grade !== undefined && (
        <div>
          <h4 className="text-sm font-medium mb-2">Grade:</h4>
          <p className="text-sm">{assignment.submission.grade} / {assignment.points} points</p>
          
          {assignment.submission.feedback && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">Teacher Feedback:</h4>
              <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{assignment.submission.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SubmissionDialogProps {
  assignment: Assignment;
  submissionContent: string;
  setSubmissionContent: (content: string) => void;
  submissionError: string;
  isSubmitting: boolean;
  handleSubmit: () => void;
}

const SubmissionDialog: React.FC<SubmissionDialogProps> = ({
  assignment,
  submissionContent,
  setSubmissionContent,
  submissionError,
  isSubmitting,
  handleSubmit
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Assignment:</h4>
        <p className="text-sm">{assignment.description}</p>
      </div>
      
      <AssignmentContent assignment={assignment} />
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Your Response:</h4>
        <Textarea 
          value={submissionContent}
          onChange={(e) => setSubmissionContent(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          error={submissionError}
        />
      </div>
      
      <DialogFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> 
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Assignment
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};
