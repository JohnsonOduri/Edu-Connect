
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseMaterialsView } from "./CourseMaterialsView";
import { CourseAssignmentsView } from "./CourseAssignmentsView";
import { CourseAttendanceView } from "./CourseAttendanceView";
import { AssignmentDetailView } from "./AssignmentDetailView";
import { Assignment } from "./types/assignment-types";
import { StudentCodingLabView } from "./StudentCodingLabView";
import { StudentQuizView } from "./StudentQuizView";
import { Code, BookOpen, Check, Brain } from "lucide-react";

interface CourseDetailViewProps {
  selectedCourse: any;
  courseAssignments: any[];
  courseAttendance: any[];
  onBack: () => void;
  onAssignmentsChange: (updatedAssignment: Assignment) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  selectedCourse,
  courseAssignments,
  courseAttendance,
  onBack,
  onAssignmentsChange
}) => {
  const [selectedTab, setSelectedTab] = useState("materials");
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const handleAssignmentSelect = (assignment: any) => {
    setSelectedAssignment(assignment);
  };

  const handleAssignmentSubmit = (updatedAssignment: Assignment) => {
    // Pass the updated assignment to the parent component
    onAssignmentsChange(updatedAssignment);
    setSelectedAssignment(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Back to Courses
        </Button>
        <h2 className="text-2xl font-bold">{selectedCourse.course.title}</h2>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="materials">
            <BookOpen className="h-4 w-4 mr-2" />
            Course Materials
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Check className="h-4 w-4 mr-2" /> 
            Assignments
          </TabsTrigger>
          <TabsTrigger value="coding-lab">
            <Code className="h-4 w-4 mr-2" />
            Coding Lab
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <Brain className="h-4 w-4 mr-2" />
            Quizzes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials" className="space-y-6">
          <CourseMaterialsView 
            course={selectedCourse.course}
            enrollment={selectedCourse}
          />
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-6">
          {selectedAssignment ? (
            <AssignmentDetailView 
              assignment={selectedAssignment}
              onBack={() => setSelectedAssignment(null)}
              onSubmit={handleAssignmentSubmit}
            />
          ) : (
            <CourseAssignmentsView 
              assignments={courseAssignments}
              onAssignmentSelect={handleAssignmentSelect}
            />
          )}
        </TabsContent>
        
        <TabsContent value="coding-lab" className="space-y-6">
          <StudentCodingLabView courseId={selectedCourse.course.id} />
        </TabsContent>
        
        <TabsContent value="quizzes" className="space-y-6">
          <StudentQuizView courseId={selectedCourse.course.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
