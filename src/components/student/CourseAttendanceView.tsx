
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle } from "lucide-react";

interface CourseAttendanceViewProps {
  attendance: any[];
}

export const CourseAttendanceView: React.FC<CourseAttendanceViewProps> = ({ attendance }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Present
          </Badge>
        );
      case "absent":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Late
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">Unknown</Badge>
        );
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4">Attendance Records</h3>
        {attendance.length > 0 ? (
          <div className="space-y-4">
            {attendance
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No attendance records found for this course
          </p>
        )}
      </CardContent>
    </Card>
  );
};
