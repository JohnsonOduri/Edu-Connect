
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, FileText, RotateCw, CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";

export const PlagiarismChecker = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<null | {
    plagiarismScore: number;
    analysis: string[];
    matchedSources: string[];
  }>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    setIsChecking(true);

    try {
      // For demonstration purposes - in a real app, this would call a plagiarism API
      setTimeout(() => {
        const mockResult = {
          plagiarismScore: Math.floor(Math.random() * 100),
          analysis: [
            "Text analyzed for common patterns and online matches.",
            "Linguistic analysis performed to detect unusual writing styles.",
            "Paragraph structures examined for consistency with student's writing.",
          ],
          matchedSources: [
            "www.example.com/essay-resources (73% match)",
            "www.academicpapers.org/topics/science (41% match)",
          ]
        };
        
        setResult(mockResult);
        toast.success("Content analysis completed");
        setIsChecking(false);
      }, 2000);
    } catch (error) {
      console.error("Error checking content:", error);
      toast.error("Failed to analyze the content");
      setIsChecking(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    
    const resultText = `
Plagiarism Score: ${result.plagiarismScore.toFixed(1)}%

Analysis Results:
${result.analysis.map(item => `- ${item}`).join('\n')}

Matched Sources:
${result.matchedSources.map(source => `- ${source}`).join('\n')}

Text Analyzed:
${text}
    `.trim();
    
    navigator.clipboard.writeText(resultText)
      .then(() => toast.success("Report copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const getScoreColor = (score: number) => {
    if (score < 20) return "text-green-500";
    if (score < 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score < 20) return "bg-green-500";
    if (score < 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plagiarism Checker</CardTitle>
        <CardDescription>
          Check student submissions for potential plagiarism
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Student Submission</h3>
            <Textarea
              placeholder="Paste student submission here..."
              className="min-h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button 
              onClick={handleCheck} 
              disabled={isChecking || !text.trim()}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Check for Plagiarism
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Analysis Results</h3>
            
            {isChecking ? (
              <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px] border rounded-md p-4">
                <RotateCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing content...</p>
              </div>
            ) : result ? (
              <div className="space-y-4 border rounded-md p-4 min-h-[200px]">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Plagiarism Score</span>
                    <span className={`text-sm font-medium ${getScoreColor(result.plagiarismScore)}`}>
                      {result.plagiarismScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.plagiarismScore} className={getProgressColor(result.plagiarismScore)} />
                </div>
                
                {result.matchedSources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Matched Sources</h4>
                    <ul className="space-y-1">
                      {result.matchedSources.map((source, index) => (
                        <li key={index} className="text-xs text-muted-foreground">
                          {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Analysis</h4>
                  <ul className="space-y-1">
                    {result.analysis.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground min-h-[200px] border rounded-md p-4">
                <AlertTriangle className="h-8 w-8" />
                <p className="text-sm">Submit content for analysis to see results</p>
              </div>
            )}
            
            {result && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Report
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
