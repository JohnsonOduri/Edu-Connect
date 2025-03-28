
export interface AICourseModule {
  id: string;
  title: string;
  description: string;
  topics: AiCourseTopic[];
  day: number;
}

export interface AiCourseTopic {
  id: string;
  title: string;
  theory: string;
  practiceQuestions: PracticeQuestion[];
  resources: Resource[];
}

export interface PracticeQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface Resource {
  id: string;
  type: "youtube" | "website" | "article";
  title: string;
  url: string;
  description?: string;
}

export interface TopicPdf {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleDay: number;
  topicTitle: string;
  pdfContent: string;
  contentBase64: string;
}

export interface AIGeneratedCourse {
  id: string;
  title: string;
  description: string;
  syllabus: string;
  durationDays: number;
  modules: AICourseModule[];
  topicPdfs?: TopicPdf[];
  createdAt: string;
}
