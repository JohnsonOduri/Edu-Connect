
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    category: string;
    created_at: string;
    access_code?: string;
  };
  onClick: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <Card key={course.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-0">
        <div className="p-6">
          <Badge className="mb-2">{course.category}</Badge>
          <h3 className="text-lg font-semibold line-clamp-1">{course.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Book className="h-4 w-4" />
            <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
          </div>
          {course.access_code && (
            <div className="mt-2 text-sm bg-muted/30 p-1.5 rounded font-mono">
              Access Code: {course.access_code}
            </div>
          )}
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {course.description || "No description provided"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
