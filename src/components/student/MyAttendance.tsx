
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { database } from "@/firebase";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarDays, Calendar as CalendarIcon, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { AttendanceRecord } from "@/lib/types";

export const MyAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    const fetchAttendanceRecords = async () => {
      try {
        const attendanceRef = query(
          ref(database, 'attendance'),
          orderByChild('student_id'),
          equalTo(user.id)
        );
        
        onValue(attendanceRef, (snapshot) => {
          const records: AttendanceRecord[] = [];
          
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const data = childSnapshot.val();
              records.push({
                id: childSnapshot.key || "",
                courseId: data.course_id || "default",
                date: data.date,
                status: data.status,
                student_id: data.student_id,
                teacher_id: data.teacher_id,
              });
            });
            
            // Fetch teacher names
            const teacherIds = Array.from(new Set(records.filter(record => record.teacher_id).map(record => record.teacher_id || "")));
            fetchTeachers(teacherIds);
            
            // Fetch course names
            const courseIds = Array.from(new Set(records.filter(record => record.courseId).map(record => record.courseId)));
            fetchCourses(courseIds);
          }
          
          setAttendance(records);
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error fetching attendance records:", error);
        toast({
          title: "Error",
          description: "Failed to load your attendance records",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchAttendanceRecords();
  }, [user?.id, toast]);

  const fetchTeachers = async (teacherIds: string[]) => {
    if (teacherIds.length === 0) return;
    
    const teacherData: Record<string, string> = {};
    
    for (const id of teacherIds) {
      const teacherRef = ref(database, `users/${id}`);
      
      onValue(teacherRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          teacherData[id] = data.name || `Teacher ${id.substring(0, 5)}`;
        }
      });
    }
    
    setTeachers(teacherData);
  };

  const fetchCourses = async (courseIds: string[]) => {
    if (courseIds.length === 0) return;
    
    const courseData: Record<string, string> = {};
    
    for (const id of courseIds) {
      if (id === "default") {
        courseData[id] = "General";
        continue;
      }
      
      const courseRef = ref(database, `courses/${id}`);
      
      onValue(courseRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          courseData[id] = data.title || `Course ${id.substring(0, 5)}`;
        } else {
          courseData[id] = "Unknown Course";
        }
      });
    }
    
    setCourses(courseData);
  };

  const getAttendanceForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return attendance.filter(record => 
      record.date === dateString
    );
  };

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

  // Get attendance stats
  const totalDays = attendance.length;
  const presentDays = attendance.filter(record => record.status === "present").length;
  const absentDays = attendance.filter(record => record.status === "absent").length;
  const lateDays = attendance.filter(record => record.status === "late").length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Attendance</h2>
          <p className="text-muted-foreground">View your attendance records across all classes</p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold mt-1">{attendanceRate}%</p>
              </div>
              <div className={`p-2 rounded-full ${attendanceRate >= 90 ? 'bg-green-100' : attendanceRate >= 75 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <CalendarDays className={`h-6 w-6 ${attendanceRate >= 90 ? 'text-green-500' : attendanceRate >= 75 ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Present Days</p>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <p className="text-2xl font-bold">{presentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Absent Days</p>
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-500" />
                <p className="text-2xl font-bold">{absentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Late Days</p>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <p className="text-2xl font-bold">{lateDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {getAttendanceForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getAttendanceForDate(selectedDate).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">
                          {courses[record.courseId] || "Unknown Course"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Teacher: {teachers[record.teacher_id] || "Unknown Teacher"}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  No attendance records found for this date
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : attendance.length > 0 ? (
            <div className="space-y-3">
              {attendance
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{format(new Date(record.date), 'MMMM d, yyyy')}</p>
                        {getStatusBadge(record.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {courses[record.courseId] || "Unknown Course"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No attendance records found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
