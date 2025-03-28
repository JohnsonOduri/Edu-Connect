import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { database } from "@/firebase";
import { ref, onValue, push, set, update, query, orderByChild, equalTo } from "firebase/database";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarCheck, Users, Check, X, UserCheck } from "lucide-react";
import { AttendanceRecord } from "@/lib/types";

interface AttendanceTrackerProps {
  courseId?: string;
  students?: any[];
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ courseId, students: initialStudents }) => {
  const [students, setStudents] = useState<any[]>(initialStudents || []);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (initialStudents?.length) {
      setStudents(initialStudents);
      if (courseId) {
        fetchAttendanceRecords(initialStudents, courseId);
      }
      return;
    }

    if (!user || !courseId) return;

    // Find students enrolled in this course
    const enrollmentsRef = query(
      ref(database, 'enrollments'),
      orderByChild('course_id'),
      equalTo(courseId)
    );
    
    const unsubscribe = onValue(enrollmentsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      const enrolledStudents: any[] = [];
      snapshot.forEach((childSnapshot) => {
        const enrollment = childSnapshot.val();
        enrolledStudents.push({
          id: enrollment.student_id,
          name: enrollment.student_name || `Student ${enrollment.student_id.substring(0, 6)}`,
          enrolled_at: enrollment.enrolled_at,
        });
      });
      
      setStudents(enrolledStudents);
      
      // Now fetch attendance for these students
      fetchAttendanceRecords(enrolledStudents, courseId);
    });
    
    return () => unsubscribe();
  }, [user, courseId, initialStudents]);

  const fetchAttendanceRecords = (studentList: any[], courseId: string) => {
    if (studentList.length === 0) {
      setLoading(false);
      return;
    }
    
    const attendanceRef = query(
      ref(database, 'attendance'),
      orderByChild('courseId'),
      equalTo(courseId)
    );
    
    onValue(attendanceRef, (snapshot) => {
      const attendanceByStudent: Record<string, AttendanceRecord[]> = {};
      
      studentList.forEach(student => {
        attendanceByStudent[student.id] = [];
      });
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const record = childSnapshot.val();
          if (attendanceByStudent[record.student_id]) {
            attendanceByStudent[record.student_id].push({
              id: childSnapshot.key || '',
              ...record
            });
          }
        });
      }
      
      setAttendance(attendanceByStudent);
      setLoading(false);
    });
  };

  const getAttendanceForDateAndStudent = (studentId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const studentAttendance = attendance[studentId] || [];
    
    return studentAttendance.find(record => 
      format(new Date(record.date), 'yyyy-MM-dd') === dateString
    );
  };

  const markAttendance = async (studentId: string, status: "present" | "absent" | "late") => {
    if (!user || !courseId) return;
    
    setSavingAttendance(true);
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const existingRecord = getAttendanceForDateAndStudent(studentId, selectedDate);
    
    try {
      if (existingRecord) {
        // Update existing record
        const recordRef = ref(database, `attendance/${existingRecord.id}`);
        await update(recordRef, { status });
      } else {
        // Create new record
        const attendanceRef = push(ref(database, 'attendance'));
        const newRecord = {
          id: attendanceRef.key,
          student_id: studentId,
          courseId: courseId,
          date: dateString,
          status,
          recorded_at: new Date().toISOString(),
        };
        
        await set(attendanceRef, newRecord);
      }
      
      toast.success(`Marked student as ${status} for ${format(selectedDate, 'PP')}`);
      
      // Update local state
      setAttendance(prev => {
        const newAttendance = { ...prev };
        const studentRecords = [...(newAttendance[studentId] || [])];
        
        if (existingRecord) {
          const index = studentRecords.findIndex(r => r.id === existingRecord.id);
          if (index !== -1) {
            studentRecords[index] = { ...existingRecord, status };
          }
        } else {
          studentRecords.push({
            id: Math.random().toString(36).substring(2, 11), 
            student_id: studentId,
            courseId, 
            date: dateString,
            status,
          } as AttendanceRecord);
        }
        
        newAttendance[studentId] = studentRecords;
        return newAttendance;
      });
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast.error("Failed to record attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Not Recorded</Badge>;
    
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-500">Late</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!courseId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p>Please select a course to manage attendance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Attendance Tracker</h2>
          <p className="text-muted-foreground">Record and monitor student attendance</p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarCheck className="h-4 w-4 mr-2" />
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

      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No enrolled students</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Share your course access code with students so they can enroll.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              <span>Attendance for {format(selectedDate, 'MMMM d, yyyy')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => {
                const record = getAttendanceForDateAndStudent(student.id, selectedDate);
                
                return (
                  <div key={student.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <div className="mt-1">
                        {getStatusBadge(record?.status)}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        variant={record?.status === "present" ? "default" : "outline"}
                        onClick={() => markAttendance(student.id, "present")}
                        disabled={savingAttendance}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Present
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant={record?.status === "late" ? "default" : "outline"}
                        className={record?.status === "late" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                        onClick={() => markAttendance(student.id, "late")}
                        disabled={savingAttendance}
                      >
                        Late
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant={record?.status === "absent" ? "destructive" : "outline"}
                        onClick={() => markAttendance(student.id, "absent")}
                        disabled={savingAttendance}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Absent
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
