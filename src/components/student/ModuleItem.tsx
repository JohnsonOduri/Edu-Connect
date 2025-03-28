
import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { BookOpen, Youtube, Globe, FileText } from "lucide-react";
import { AICourseModule } from "./types/ai-course-types";

interface ModuleItemProps {
  module: AICourseModule;
}

export const ModuleItem: React.FC<ModuleItemProps> = ({ module }) => {
  return (
    <AccordionItem value={module.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center">
          <Badge className="mr-2 bg-primary">{`Day ${module.day}`}</Badge>
          <span>{module.title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-2 border-l-2 border-muted space-y-4">
          <p className="text-sm">{module.description}</p>

          {module.topics.map((topic) => (
            <div key={topic.id} className="mt-4 space-y-3">
              <h4 className="text-md font-semibold flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                {topic.title}
              </h4>

              <div className="pl-6">
                <h5 className="text-sm font-medium">Theory</h5>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {topic.theory}
                </p>

                <h5 className="text-sm font-medium mt-4">Practice Questions</h5>
                <Accordion type="multiple" className="w-full">
                  {topic.practiceQuestions.map((question) => (
                    <AccordionItem key={question.id} value={question.id}>
                      <AccordionTrigger className="text-sm py-2">
                        {question.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm">{question.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <h5 className="text-sm font-medium mt-4">Resources</h5>
                <div className="space-y-2 mt-2">
                  {topic.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 text-sm bg-muted/50 rounded-md hover:bg-muted"
                    >
                      {resource.type === "youtube" && (
                        <Youtube className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      {resource.type === "website" && (
                        <Globe className="h-4 w-4 mr-2 text-blue-500" />
                      )}
                      {resource.type === "article" && (
                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      <div>
                        <span>{resource.title}</span>
                        {resource.description && (
                          <p className="text-xs text-muted-foreground">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
