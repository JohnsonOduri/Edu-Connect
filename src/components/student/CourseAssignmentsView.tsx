
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseAssignmentsViewProps {
  assignments: any[];
  onAssignmentSelect: (assignment: any) => void;
}

export const CourseAssignmentsView: React.FC<CourseAssignmentsViewProps> = ({
  assignments,
  onAssignmentSelect
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4">Assignments</h3>
        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className="flex items-center justify-between p-4 border rounded-md cursor-pointer hover:bg-accent/30"
                onClick={() => onAssignmentSelect(assignment)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{assignment.title}</p>
                    {assignment.submitted ? (
                      <Badge className="bg-green-500">Submitted</Badge>
                    ) : (
                      <Badge variant="outline">Not Submitted</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-muted-foreground">
                      Due: {assignment.due_date ? 
                        new Date(assignment.due_date).toLocaleDateString() : 
                        "No due date"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.points} points
                    </p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  {assignment.submitted ? 'View Submission' : 'Submit'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No assignments available for this course yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};
