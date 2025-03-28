
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code, Play, CheckCircle, XCircle, FileCode, Download, Upload, Copy } from "lucide-react";
import { toast } from "sonner";

export const CodeEditor = () => {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("dark");
  const [currentCode, setCurrentCode] = useState(
    `// Write your code here\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("World"));`
  );
  const [output, setOutput] = useState<{result?: string, error?: string} | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const runCode = () => {
    setIsRunning(true);
    setOutput(null);
    
    // Mock execution
    setTimeout(() => {
      try {
        if (language === "javascript") {
          // Simulate code execution
          if (currentCode.includes("console.log")) {
            setOutput({
              result: "Hello, World!"
            });
          } else if (currentCode.includes("error") || Math.random() < 0.1) {
            throw new Error("Unexpected token error");
          } else {
            setOutput({
              result: "Code executed successfully, but no output was generated."
            });
          }
        } else {
          setOutput({
            result: `[${language.toUpperCase()} Output]\nHello, World!`
          });
        }
        toast.success("Code executed successfully!");
      } catch (err: any) {
        setOutput({
          error: err.message || "An error occurred during execution"
        });
        toast.error("Execution failed. Check the error message.");
      } finally {
        setIsRunning(false);
      }
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Code Editor</h2>
          <p className="text-muted-foreground">Write, test, and submit your code</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  <span>main.{language === "javascript" ? "js" : language === "python" ? "py" : language === "java" ? "java" : language === "cpp" ? "cpp" : "cs"}</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    <span className="hidden md:inline">Download</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Upload className="h-4 w-4" />
                    <span className="hidden md:inline">Upload</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Copy className="h-4 w-4" />
                    <span className="hidden md:inline">Copy</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`code-editor ${theme === "dark" ? "bg-black" : "bg-gray-100"} rounded-md`}>
                <div className="flex border-b border-border">
                  <div className={`px-4 py-1 ${theme === "dark" ? "bg-zinc-900 text-gray-400" : "bg-gray-200 text-gray-600"} text-xs font-mono`}>
                    Lines: {currentCode.split('\n').length}
                  </div>
                </div>
                <Textarea
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value)}
                  className={`font-mono text-sm p-4 min-h-[400px] border-0 rounded-t-none focus-visible:ring-0 ${
                    theme === "dark" 
                      ? "bg-black text-white placeholder:text-gray-500" 
                      : "bg-gray-100 text-black placeholder:text-gray-400"
                  }`}
                  placeholder="Write your code here..."
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Code className="h-4 w-4 mr-1" />
                {language === "javascript"
                  ? "Node.js v16.14.0"
                  : language === "python"
                    ? "Python 3.9.7"
                    : language === "java"
                      ? "OpenJDK 17"
                      : language === "cpp"
                        ? "G++ 11.2.0"
                        : "C# 10.0 (.NET 6.0)"
                }
              </div>
              <Button 
                onClick={runCode} 
                disabled={isRunning} 
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Code
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`font-mono text-sm p-4 rounded-md min-h-[120px] ${
                theme === "dark" 
                  ? "bg-black text-white" 
                  : "bg-gray-100 text-black"
              }`}>
                {isRunning ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Running code...</span>
                  </div>
                ) : output ? (
                  output.error ? (
                    <div className="text-red-500">
                      Error: {output.error}
                    </div>
                  ) : (
                    <div>
                      {output.result}
                    </div>
                  )
                ) : (
                  <div className="text-muted-foreground">
                    Run your code to see output here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">String Manipulation Challenge</h3>
                  <p className="text-sm text-muted-foreground mt-1">Due in 3 days</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm">
                    Create a function that takes a string and returns it with the first and last characters swapped.
                    If the string is less than 2 characters long, return the string unchanged.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Example</h4>
                  <div className={`font-mono text-xs p-2 rounded-md ${theme === "dark" ? "bg-zinc-900" : "bg-gray-200"}`}>
                    <p>Input: "hello"</p>
                    <p>Output: "oellh"</p>
                    <br />
                    <p>Input: "a"</p>
                    <p>Output: "a"</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Test Cases</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>swapEnds("hello") → "oellh"</span>
                      <Badge variant="outline" className="text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Passed
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>swapEnds("a") → "a"</span>
                      <Badge variant="outline" className="text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Passed
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>swapEnds("ab") → "ba"</span>
                      <Badge variant="outline" className="text-red-500">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full">Submit Assignment</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="syntax">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="syntax">Syntax</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>
                <div className="mt-4 space-y-4">
                  {language === "javascript" && (
                    <>
                      <div className="text-sm" data-state={true}>
                        <h4 className="font-medium mb-1">String Methods</h4>
                        <div className="space-y-2">
                          <div>
                            <code className="text-xs bg-primary/10 p-1 rounded">.charAt(index)</code>
                            <p className="text-xs text-muted-foreground mt-1">Returns the character at the specified index.</p>
                          </div>
                          <div>
                            <code className="text-xs bg-primary/10 p-1 rounded">.substring(start, end)</code>
                            <p className="text-xs text-muted-foreground mt-1">Extracts characters between two indices.</p>
                          </div>
                          <div>
                            <code className="text-xs bg-primary/10 p-1 rounded">.length</code>
                            <p className="text-xs text-muted-foreground mt-1">Returns the length of a string.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {language === "python" && (
                    <>
                      <div className="text-sm" data-state={true}>
                        <h4 className="font-medium mb-1">String Indexing</h4>
                        <div className="space-y-2">
                          <div>
                            <code className="text-xs bg-primary/10 p-1 rounded">s[index]</code>
                            <p className="text-xs text-muted-foreground mt-1">Access character at index.</p>
                          </div>
                          <div>
                            <code className="text-xs bg-primary/10 p-1 rounded">s[start:end]</code>
                            <p className="text-xs text-muted-foreground mt-1">Slices from start to end-1.</p>
                          </div>
                          <div>
                            <code className="text-xs bg-primary/10 p-1 rounded">len(s)</code>
                            <p className="text-xs text-muted-foreground mt-1">Returns the length of a string.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
