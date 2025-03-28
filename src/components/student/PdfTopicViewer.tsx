
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { jsPDF } from "jspdf";

interface TopicPdf {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleDay: number;
  topicTitle: string;
  pdfContent: string;
  contentBase64: string;
}

interface PdfTopicViewerProps {
  topicPdfs: TopicPdf[];
  courseName: string;
}

export const PdfTopicViewer: React.FC<PdfTopicViewerProps> = ({
  topicPdfs,
  courseName,
}) => {
  const [currentPdfIndex, setCurrentPdfIndex] = useState(0);
  const [pdfText, setPdfText] = useState<string>("");
  
  useEffect(() => {
    if (topicPdfs && topicPdfs.length > 0) {
      // Remove markdown formatting from the content
      const cleanedContent = topicPdfs[currentPdfIndex].pdfContent
        .replace(/#+\s/g, "") // Remove markdown headings
        .replace(/\*\*/g, "")  // Remove bold markers
        .replace(/\*/g, "")    // Remove italic markers
        .replace(/`/g, "")     // Remove code markers
        .replace(/\n\n/g, "\n"); // Reduce double line breaks
      
      setPdfText(cleanedContent || "");
    }
  }, [currentPdfIndex, topicPdfs]);
  
  if (!topicPdfs || topicPdfs.length === 0) {
    return <div>No PDF content available</div>;
  }
  
  const currentPdf = topicPdfs[currentPdfIndex];
  
  const downloadPdf = () => {
    try {
      // Create a new PDF with A4 format
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Set up PDF document properties
      const title = `${courseName} - ${currentPdf.moduleTitle} - ${currentPdf.topicTitle}`;
      doc.setProperties({
        title: title,
        subject: `Learning material for ${courseName}`,
        author: "AI Course Generator",
        keywords: "education, learning, course",
        creator: "AI Course Generator"
      });
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15; // margin in mm
      const contentWidth = pageWidth - (2 * margin);
      
      // Starting position
      let y = margin;
      
      // Draw page border - added for all pages
      const drawPageBorder = () => {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.5);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
      };
      
      drawPageBorder(); // Draw border on first page
      
      // Add header with background
      doc.setFillColor(230, 230, 240);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      // Add course title - larger and bold
      doc.setFont("helvetica", "bold"); // Using helvetica for stronger, bolder appearance
      doc.setFontSize(18); // Increased from 16
      doc.setTextColor(0, 0, 100); // Slightly blue color for title
      doc.text(title, margin, y + 10);
      
      // Add a line under the title
      y += 15;
      doc.setLineWidth(1); // Thicker line
      doc.setDrawColor(50, 50, 150); // Blue line
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      
      // Add subtitle with day and module
      doc.setFontSize(14); // Larger subtitle
      doc.setTextColor(50, 50, 100); // Slightly blue color
      doc.text(`Day ${currentPdf.moduleDay}`, margin, y);
      y += 10;
      
      // Parse the content by sections to add proper formatting
      // We're removing any markdown formatting here
      const contentWithoutMarkdown = currentPdf.pdfContent
        .replace(/#+\s/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)"); // Convert links to text + URL format
      
      const sections = contentWithoutMarkdown.split(/\n\n+/);
      
      sections.forEach((section) => {
        // Check if we need a new page
        if (y > pageHeight - margin) {
          doc.addPage();
          drawPageBorder(); // Add border to new page
          y = margin;
        }
        
        // Check if this is a heading (usually the first line of a section)
        const lines = section.split('\n');
        
        if (lines[0].includes("Question") || lines[0].includes("Resource")) {
          // This is a question or resource heading
          doc.setFont("helvetica", "bold"); // Using helvetica bold
          doc.setFontSize(13); // Slightly larger for question/resource headings
          doc.setTextColor(50, 50, 100); // Blue-ish color for headings
          doc.text(lines[0], margin, y);
          y += 7;
          
          // The rest is content
          if (lines.length > 1) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11); // Slightly larger base font
            doc.setTextColor(20, 20, 20); // Near black for better readability
            
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                // Split text to ensure it doesn't exceed page width
                const textLines = doc.splitTextToSize(lines[i], contentWidth);
                
                // Check if we need a new page
                if (y + (textLines.length * 5) > pageHeight - margin) {
                  doc.addPage();
                  drawPageBorder(); // Add border to new page
                  y = margin;
                }
                
                doc.text(textLines, margin, y);
                y += textLines.length * 5 + 2;
              }
            }
          }
          
          // Add some space after each question/resource
          y += 5;
        } else if (section.toLowerCase().includes("practice questions") || 
                  section.toLowerCase().includes("learning resources")) {
          // This is a major section heading
          // Add some space before major sections
          y += 5;
          
          // Add background for section headings
          doc.setFillColor(220, 220, 240); // Lighter blue background
          doc.rect(margin - 2, y - 5, contentWidth + 4, 10, 'F');
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(15); // Larger headings
          doc.setTextColor(0, 0, 100); // Blue color
          doc.text(section, margin, y);
          y += 10;
        } else {
          // Regular content - check each line for potential subsections
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11); // Slightly larger font for content
          doc.setTextColor(20, 20, 20); // Near black
          
          lines.forEach((line) => {
            if (line.trim()) {
              // Check if this might be a subheading (ends with a colon)
              if (line.trim().endsWith(':')) {
                doc.setFont("helvetica", "bold");
                doc.setTextColor(40, 40, 80); // Slightly blue for subheadings
              } else {
                doc.setFont("helvetica", "normal");
                doc.setTextColor(20, 20, 20);
              }
              
              // Split text to ensure it doesn't exceed page width
              const textLines = doc.splitTextToSize(line, contentWidth);
              
              // Check if we need a new page
              if (y + (textLines.length * 5) > pageHeight - margin) {
                doc.addPage();
                drawPageBorder(); // Add border to new page
                y = margin;
              }
              
              doc.text(textLines, margin, y);
              y += textLines.length * 5 + 2;
            }
          });
        }
      });
      
      // Add page numbers to each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
      }
      
      // Save the PDF with module day and topic in the filename
      doc.save(`${courseName}_Day${currentPdf.moduleDay}_${currentPdf.topicTitle.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };
  
  const goToNextPdf = () => {
    if (currentPdfIndex < topicPdfs.length - 1) {
      setCurrentPdfIndex(currentPdfIndex + 1);
    }
  };
  
  const goToPreviousPdf = () => {
    if (currentPdfIndex > 0) {
      setCurrentPdfIndex(currentPdfIndex - 1);
    }
  };
  
  // Function to render text with paragraphs
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      paragraph.trim() ? <p key={index} className="mb-2 font-mono">{paragraph}</p> : <br key={index} />
    ));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {currentPdf.moduleTitle} - {currentPdf.topicTitle}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline">Day {currentPdf.moduleDay}</Badge>
              <Badge variant="secondary">
                PDF {currentPdfIndex + 1} of {topicPdfs.length}
              </Badge>
            </CardDescription>
          </div>
          <Button onClick={downloadPdf} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 bg-card mb-4 overflow-auto max-h-[60vh] font-mono">
          {renderFormattedText(pdfText)}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button 
            variant="outline" 
            onClick={goToPreviousPdf}
            disabled={currentPdfIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous Topic
          </Button>
          <Button 
            variant="outline" 
            onClick={goToNextPdf}
            disabled={currentPdfIndex === topicPdfs.length - 1}
          >
            Next Topic <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
