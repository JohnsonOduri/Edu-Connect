
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Video, Link, File, Plus } from "lucide-react";

export const ContentManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Content Management</h2>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ContentTypeCard 
          title="Documents" 
          icon={<FileText className="h-6 w-6 text-blue-500" />}
          count={24}
          color="bg-blue-50 dark:bg-blue-950/40"
        />
        <ContentTypeCard 
          title="Videos" 
          icon={<Video className="h-6 w-6 text-red-500" />}
          count={12}
          color="bg-red-50 dark:bg-red-950/40"
        />
        <ContentTypeCard 
          title="Links" 
          icon={<Link className="h-6 w-6 text-green-500" />}
          count={36}
          color="bg-green-50 dark:bg-green-950/40"
        />
        <ContentTypeCard 
          title="Other Files" 
          icon={<File className="h-6 w-6 text-purple-500" />}
          count={8}
          color="bg-purple-50 dark:bg-purple-950/40"
        />
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center space-y-3">
          <div className="bg-primary/10 h-14 w-14 rounded-full flex items-center justify-center mx-auto">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-lg">Upload Course Materials</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Drag and drop files here, or click to select files. Supported formats: PDF, DOCX, MP4, JPG, PNG.
          </p>
          <Button size="sm" className="mt-2">Select Files</Button>
        </div>
      </div>

      <div className="my-6">
        <h3 className="text-lg font-medium mb-4">Recent Uploads</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Introduction to React.pdf</h4>
                  <p className="text-xs text-muted-foreground">
                    Uploaded 2 days ago • 2.4 MB
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ContentTypeCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const ContentTypeCard = ({ title, icon, count, color }: ContentTypeCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-3xl font-bold">{count}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
