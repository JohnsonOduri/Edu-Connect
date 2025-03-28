
export interface Assignment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  course_name: string;
  due_date?: string;
  points: number;
  teacher_id: string;
  assignmentType?: string;
  textContent?: string;
  fileURL?: string | null;
  aiGeneratedContent?: string | null;
  submitted?: boolean;
  submission?: {
    id: string;
    content?: string;
    file_url?: string;
    submitted_at: string;
    grade?: number;
    feedback?: string;
  };
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  student_name: string;
  content?: string;
  file_url?: string;
  submitted_at: string;
  course_id: string;
  course_name: string;
  teacher_id: string;
  assignment_title: string;
  grade?: number | null;
  feedback?: string | null;
}
