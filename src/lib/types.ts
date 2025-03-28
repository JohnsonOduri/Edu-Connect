export type UserRole = "student" | "teacher" | "admin" | "moderator";

export interface User {
  id: string;
  name: string;
  email?: string; // Make email optional to handle profiles without email
  role: UserRole;
  avatar?: string;
  accessCode?: string; // Added for teacher-student connections
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor?: string;
  category?: string;
  prerequisites?: string[];
  startDate?: string;
  endDate?: string;
  schedule?: string[];
  materials?: CourseMaterial[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  type: "pdf" | "video" | "link" | "document";
  content?: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
  publish_date?: string;
  deadline?: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  completed: boolean;
  completion_date?: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  due_date?: string;
  points: number;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  content?: string;
  file_url?: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  created_at: string;
  read: boolean;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  teacher_id?: string;
  courseId: string;
  date: string;
  status: "present" | "absent" | "late";
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  requirements: string;
  xp_value: number;
}

export interface UserXP {
  id: string;
  user_id: string;
  course_id?: string;
  activity_type: "quiz_completion" | "assignment_submission" | "discussion" | "attendance" | "challenge";
  xp_amount: number;
  earned_at: string;
}

export interface CodeSubmission {
  id: string;
  user_id: string;
  assignment_id: string;
  language: "python" | "javascript" | "java" | "cpp" | "csharp" | "other";
  code_content: string;
  submitted_at: string;
  auto_grade_status?: "pending" | "completed" | "failed";
  auto_grade_result?: number;
  feedback?: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_ai_generated: boolean;
  created_at: string;
}

export interface StudyPlanItem {
  id: string;
  study_plan_id: string;
  title: string;
  description?: string;
  due_date: string;
  duration_minutes: number;
  is_completed: boolean;
  completed_at?: string;
  type: "lecture" | "reading" | "assignment" | "quiz" | "exam" | "other";
}

export interface AIContentCheck {
  id: string;
  submission_id: string;
  ai_probability: number;
  plagiarism_score: number;
  analysis_results: string[];
  checked_at: string;
  checked_by: string;
}

export interface TeacherConnection {
  id: string;
  teacher_id: string;
  student_id: string;
  access_code: string;
  connected_at: string;
  status: "active" | "inactive" | "pending";
}
