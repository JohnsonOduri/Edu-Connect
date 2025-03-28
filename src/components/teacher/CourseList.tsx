
import React from "react";
import { BookOpen } from "lucide-react";
import { CourseCard } from "./CourseCard";

interface CourseListProps {
  courses: any[];
  onCourseSelect: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onCourseSelect }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No Courses Created</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first course using the form on the right.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onClick={() => onCourseSelect(course.id)}
        />
      ))}
    </div>
  );
};
