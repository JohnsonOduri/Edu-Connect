
import { v4 as uuidv4 } from 'uuid';
import { AIGeneratedCourse } from '../types/ai-course-types';
import { ref, push, serverTimestamp } from 'firebase/database';
import { database } from '@/firebase';

export async function generateCourseContent(
  syllabus: string, 
  durationDays: number, 
  title: string
): Promise<AIGeneratedCourse> {
  try {
    console.log("Generating course for:", title, "with duration:", durationDays, "days");
    
    // Call the Supabase Edge Function to generate the course
    const response = await fetch("https://educonnect-66985.supabase.co/functions/v1/generate-course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        syllabus,
        durationDays,
        title,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate course");
    }

    // Parse the response from the API
    const course = await response.json();
    
    // Clean markdown formatting in PDF content
    if (course.topicPdfs) {
      course.topicPdfs = course.topicPdfs.map((pdf: any) => {
        const cleanedContent = pdf.pdfContent
          .replace(/#+\s/g, "")  // Remove markdown headings
          .replace(/\*\*/g, "")  // Remove bold markers
          .replace(/\*/g, "")    // Remove italic markers
          .replace(/`/g, "")     // Remove code markers
          .replace(/\n\n/g, "\n"); // Reduce double line breaks
        
        return {
          ...pdf,
          pdfContent: cleanedContent,
          contentBase64: Buffer.from(cleanedContent).toString('base64')
        };
      });
    }
    
    console.log("Generated course:", course);
    
    // Save to Firebase
    saveCourseToFirebase(course);
    
    return course;
  } catch (error) {
    console.error("Error generating course content:", error);
    throw error;
  }
}

// Function to save the course to Firebase
export function saveCourseToFirebase(course: AIGeneratedCourse) {
  try {
    const coursesRef = ref(database, 'ai_generated_courses');
    push(coursesRef, {
      ...course,
      createdAt: serverTimestamp()
    });
    console.log("Course saved to Firebase successfully");
  } catch (error) {
    console.error("Error saving course to Firebase:", error);
  }
}
