
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users, FileText, BookOpen, Wand2, Brain, Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ref, get, query, orderByChild, equalTo, remove } from "firebase/database";
import { database } from "@/firebase";
import { toast } from "sonner";
import { AttendanceTracker } from "./AttendanceTracker";
import { AssignmentUploader } from "./AssignmentUploader";
import { StudentResponses } from "./StudentResponses";
import { AccessCodeManager } from "./AccessCodeManager";
import { PlagiarismChecker } from "./PlagiarismChecker";
import { LessonMapper } from "./LessonMapper";
import { QuizGenerator } from "./QuizGenerator";
import { CodingLab } from "./CodingLab";

interface CourseDetailsProps {
  courseId: string;
  onBack: () => void;
}

export const CourseDetails = ({ courseId, onBack }: CourseDetailsProps) => {
  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        // Get course data
        const courseRef = ref(database, `courses/${courseId}`);
        const courseSnapshot = await get(courseRef);
        
        if (courseSnapshot.exists()) {
          setCourse(courseSnapshot.val());
        } else {
          toast.error("Course not found");
          onBack();
          return;
        }
        
        // Get enrollments
        const enrollmentsRef = query(
          ref(database, 'enrollments'),
          orderByChild('course_id'),
          equalTo(courseId)
        );
        
        const enrollmentsSnapshot = await get(enrollmentsRef);
        const enrolledStudents = [];
        
        if (enrollmentsSnapshot.exists()) {
          const promises = [];
          
          enrollmentsSnapshot.forEach((childSnapshot) => {
            const enrollment = childSnapshot.val();
            
            // Get student details
            const studentPromise = get(ref(database, `users/${enrollment.student_id}`))
              .then(studentSnapshot => {
                if (studentSnapshot.exists()) {
                  return {
                    id: enrollment.student_id,
                    enrollmentId: childSnapshot.key,
                    ...studentSnapshot.val(),
                    enrollmentDate: enrollment.created_at
                  };
                }
                return null;
              });
            
            promises.push(studentPromise);
          });
          
          const studentsData = await Promise.all(promises);
          enrolledStudents.push(...studentsData.filter(s => s !== null));
        }
        
        setStudents(enrolledStudents);
        
        // Get assignments
        const assignmentsRef = query(
          ref(database, 'assignments'),
          orderByChild('course_id'),
          equalTo(courseId)
        );
        
        const assignmentsSnapshot = await get(assignmentsRef);
        const assignmentsData = [];
        
        if (assignmentsSnapshot.exists()) {
          assignmentsSnapshot.forEach((childSnapshot) => {
            assignmentsData.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
        }
        
        setAssignments(assignmentsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading course details:", error);
        toast.error("Failed to load course details");
        setLoading(false);
      }
    };
    
    loadCourseDetails();
  }, [courseId, onBack]);
  
  const removeStudent = async (enrollmentId: string, studentName: string) => {
    try {
      await remove(ref(database, `enrollments/${enrollmentId}`));
      setStudents(students.filter(s => s.enrollmentId !== enrollmentId));
      toast.success(`${studentName} removed from the course`);
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <h1 className="text-2xl font-bold">{course?.title}</h1>
          <p className="text-muted-foreground">{course?.description}</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <BookOpen className="h-4 w-4 mr-2" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <Brain className="h-4 w-4 mr-2" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="coding">
            <Code className="h-4 w-4 mr-2" />
            Coding Lab
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Users className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="submissions">
            <FileText className="h-4 w-4 mr-2" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wand2 className="h-4 w-4 mr-2" />
            Teaching Tools
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Title</h3>
                    <p>{course?.title}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p>{course?.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Created</h3>
                      <p>{new Date(course?.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Students</h3>
                      <p>{students.length} enrolled</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Access Code</CardTitle>
              </CardHeader>
              <CardContent>
                <AccessCodeManager courseId={courseId} courseCode={course?.access_code} />
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Enrolled Students</CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No students enrolled in this course yet.
                  </p>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Enrolled on
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {student.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {student.email}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {new Date(student.enrollmentDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStudent(student.enrollmentId, student.name)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="assignments">
          <div className="grid gap-6">
            <AssignmentUploader courseId={courseId} />
            
            <Card>
              <CardHeader>
                <CardTitle>Assignment List</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No assignments created for this course yet.
                  </p>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Submissions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {assignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {assignment.title}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No due date"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {assignment.points}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {new Date(assignment.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveTab("submissions")}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="quizzes">
          <QuizGenerator courseId={courseId} />
        </TabsContent>
        
        <TabsContent value="coding">
          <CodingLab courseId={courseId} />
        </TabsContent>
        
        <TabsContent value="attendance">
          <AttendanceTracker courseId={courseId} students={students} />
        </TabsContent>
        
        <TabsContent value="submissions">
          <StudentResponses courseId={courseId} />
        </TabsContent>
        
        <TabsContent value="tools">
          <div className="grid gap-6">
            <LessonMapper courseId={courseId} />
            <PlagiarismChecker />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
