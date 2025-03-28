
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText } from "lucide-react";

interface CourseMaterialsViewProps {
  course: any;
  enrollment: any;
}

export const CourseMaterialsView: React.FC<CourseMaterialsViewProps> = ({ 
  course,
  enrollment 
}) => {
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-4">Course Information</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Description</h4>
              <p className="text-muted-foreground">
                {course.description || "No description available"}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Instructor</h4>
              <p className="text-muted-foreground">{course.instructor_name}</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Enrolled On</h4>
              <p className="text-muted-foreground">
                {new Date(enrollment.enrolled_at).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">Progress</h4>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={enrollment.progress || 0} className="h-2 flex-1" />
                <span className="text-sm font-medium">{enrollment.progress || 0}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-4">Course Materials</h3>
          {course.materials && course.materials.length > 0 ? (
            <div className="space-y-4">
              {course.materials.map((material: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{material.title}</p>
                    <p className="text-sm text-muted-foreground">{material.type}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No materials available for this course yet
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
};
