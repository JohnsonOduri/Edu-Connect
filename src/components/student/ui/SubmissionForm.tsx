import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "../FileUpload";
import { toast } from "@/components/ui/use-toast";

interface SubmissionFormProps {
  isPastDue: boolean;
  onSubmit: (text: string, fileURL: string | null) => Promise<void>;
  onCancel: () => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ 
  isPastDue, 
  onSubmit, 
  onCancel 
}) => {
  const [submissionText, setSubmissionText] = useState("");
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmission = async () => {
    if (!submissionText && !fileURL) {
      toast.error("Please provide either text or a file for your submission");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(submissionText, fileURL);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Submit Your Work</h3>
      
      <div className="space-y-2">
        <label htmlFor="submission-text" className="block text-sm font-medium">
          Your Answer
        </label>
        <Textarea
          id="submission-text"
          rows={6}
          placeholder="Type your answer here..."
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          disabled={isPastDue}
        />
      </div>
      
      <FileUpload 
        onFileUploaded={setFileURL} 
        disabled={isPastDue} 
      />
      
      {fileURL && (
        <div className="p-2 border rounded flex justify-between items-center">
          <span className="text-sm truncate max-w-[80%]">{fileURL.split('/').pop()}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFileURL(null)}
            disabled={isSubmitting}
          >
            Remove
          </Button>
        </div>
      )}
      
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmission} 
          disabled={isSubmitting || isPastDue || (!submissionText && !fileURL)}
        >
          {isSubmitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </div>
      
      {isPastDue && (
        <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-md text-sm">
          This assignment is past due and cannot be submitted.
        </div>
      )}
    </div>
  );
};
