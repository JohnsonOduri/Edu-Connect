
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ref as storageRef, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader2, UploadCloud } from "lucide-react";

interface FileUploadProps {
  onFileUploaded: (url: string) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    
    try {
      setUploading(true);
      
      // Get storage reference
      const storage = getStorage();
      const fileRef = storageRef(storage, `submissions/${Date.now()}_${file.name}`);
      
      // Upload file
      await uploadBytes(fileRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(fileRef);
      
      // Pass URL to parent component
      onFileUploaded(downloadURL);
      toast.success("File uploaded successfully");
      
      // Reset file selection
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Upload File (optional)
      </label>
      <div className="flex gap-2">
        <Input
          type="file"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="flex-1"
        />
        <Button
          onClick={handleUpload}
          disabled={!file || disabled || uploading}
          variant="secondary"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
