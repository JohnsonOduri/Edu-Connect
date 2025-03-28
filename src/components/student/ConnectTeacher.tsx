
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ref, set, get, query, orderByChild, equalTo, onValue } from "firebase/database";
import { database } from "@/firebase";
import { Loader2, UserCheck } from "lucide-react";

export const ConnectTeacher = () => {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectedTeachers, setConnectedTeachers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id && user.role === "student") {
      // Fetch already connected teachers
      const connectionsRef = query(
        ref(database, 'teacher_connections'),
        orderByChild('student_id'),
        equalTo(user.id)
      );
      
      const unsubscribe = onValue(connectionsRef, (snapshot) => {
        const teachers: any[] = [];
        
        if (snapshot.exists()) {
          const promises: Promise<void>[] = [];
          
          snapshot.forEach((childSnapshot) => {
            const connection = childSnapshot.val();
            if (connection.status === "active") {
              // Get teacher details
              const promise = get(ref(database, `users/${connection.teacher_id}`))
                .then((teacherSnapshot) => {
                  if (teacherSnapshot.exists()) {
                    teachers.push({
                      id: connection.teacher_id,
                      name: teacherSnapshot.val().name || 'Unknown Teacher',
                      email: teacherSnapshot.val().email || 'No email provided',
                      connected_at: connection.connected_at
                    });
                  }
                })
                .catch(error => {
                  console.error("Error fetching teacher:", error);
                });
              
              promises.push(promise);
            }
          });
          
          Promise.all(promises).then(() => {
            setConnectedTeachers([...teachers]);
          });
        } else {
          setConnectedTeachers([]);
        }
      });
      
      return () => unsubscribe();
    }
  }, [user?.id, user?.role]);

  const connectWithTeacher = async () => {
    if (!user?.id || user.role !== "student" || !code.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Lookup teacher ID by access code
      const accessCodeRef = ref(database, `access_codes/${code.trim().toUpperCase()}`);
      const snapshot = await get(accessCodeRef);
      
      if (!snapshot.exists()) {
        toast.error("Invalid access code. Please check and try again.");
        return;
      }
      
      const teacherId = snapshot.val().teacher_id;
      
      // Check if already connected
      const connectionCheckRef = query(
        ref(database, 'teacher_connections'),
        orderByChild('student_id'),
        equalTo(user.id)
      );
      
      const connectionSnapshot = await get(connectionCheckRef);
      let alreadyConnected = false;
      
      if (connectionSnapshot.exists()) {
        connectionSnapshot.forEach((childSnapshot) => {
          const conn = childSnapshot.val();
          if (conn.teacher_id === teacherId && conn.status === "active") {
            alreadyConnected = true;
          }
        });
      }
      
      if (alreadyConnected) {
        toast.info("You are already connected with this teacher.");
        return;
      }
      
      // Create a new connection
      const connectionId = `${teacherId}_${user.id}`;
      await set(ref(database, `teacher_connections/${connectionId}`), {
        teacher_id: teacherId,
        student_id: user.id,
        access_code: code.trim().toUpperCase(),
        connected_at: new Date().toISOString(),
        status: "active"
      });
      
      // Get teacher details for immediate UI update
      const teacherRef = ref(database, `users/${teacherId}`);
      const teacherSnapshot = await get(teacherRef);
      
      if (teacherSnapshot.exists()) {
        const teacherData = teacherSnapshot.val();
        toast.success(`Successfully connected with ${teacherData.name || 'teacher'}!`);
      } else {
        toast.success("Successfully connected with teacher!");
      }
      
      setCode("");
    } catch (error) {
      console.error("Error connecting with teacher:", error);
      toast.error("Failed to connect with teacher. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Connect with a Teacher</CardTitle>
        <CardDescription>
          Enter a teacher's access code to connect to their class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter access code (e.g., ABC123)"
            className="font-mono uppercase"
            maxLength={6}
          />
          <Button 
            onClick={connectWithTeacher} 
            disabled={isLoading || !code.trim() || code.length < 4}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Connect
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Connected Teachers ({connectedTeachers.length})
          </h3>
          
          {connectedTeachers.length > 0 ? (
            <div className="border rounded-md divide-y">
              {connectedTeachers.map((teacher) => (
                <div key={teacher.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connected {new Date(teacher.connected_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              You haven't connected with any teachers yet. Enter an access code to get started.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          After connecting, you'll be able to access the teacher's course materials,
          assignments, and other resources.
        </p>
      </CardFooter>
    </Card>
  );
};
