
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { CourseGrid } from "./CourseGrid";
import { JoinCourseDialog } from "./JoinCourseDialog";
import { CourseDetailView } from "./CourseDetailView";
import { useCourseData } from "./hooks/useCourseData";
import { Assignment } from "./types/assignment-types";

export const MyCourses = () => {
  const {
    enrollments,
    isLoading,
    selectedCourse,
    courseAssignments,
    courseAttendance,
    loadCourseDetails,
    setSelectedCourse,
    updateAssignment
  } = useCourseData();
  
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const handleCourseSelect = async (enrollment: any) => {
    await loadCourseDetails(enrollment);
  };

  // This function adapts a single assignment update to the array update expected by CourseDetailView
  const handleAssignmentUpdate = (updatedAssignment: Assignment) => {
    // Map the current assignments, replacing the updated one
    const updatedAssignments = courseAssignments.map(assignment => 
      assignment.id === updatedAssignment.id ? updatedAssignment : assignment
    );
    
    // Call the updateAssignment with the full updated array
    updateAssignment(updatedAssignments);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <CourseDetailView
        selectedCourse={selectedCourse}
        courseAssignments={courseAssignments}
        courseAttendance={courseAttendance}
        onBack={() => setSelectedCourse(null)}
        onAssignmentsChange={handleAssignmentUpdate}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* My Enrolled Courses Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Courses</h2>
          <Button onClick={() => setShowJoinDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Join Course
          </Button>
        </div>
        
        <CourseGrid 
          enrollments={enrollments} 
          onCourseSelect={handleCourseSelect} 
        />
      </div>
      
      {/* Join Course Dialog */}
      <JoinCourseDialog 
        open={showJoinDialog} 
        onOpenChange={setShowJoinDialog} 
      />
    </div>
  );
};
