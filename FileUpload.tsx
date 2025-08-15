import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileText, FileImage, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await apiRequest('POST', '/api/documents/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your documents have been uploaded and are being processed.",
      });
      onUploadSuccess();
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload documents",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    uploadMutation.mutate(acceptedFiles);
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  return (
    <Card className="mb-6" data-testid="file-upload-section">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900" data-testid="upload-title">
            Upload Source Documents
          </h2>
          <Button variant="ghost" size="sm" data-testid="upload-guidelines">
            <AlertCircle className="w-4 h-4 mr-1" />
            Upload Guidelines
          </Button>
        </div>

        {/* Drag & Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
            isDragActive 
              ? "border-legal-blue bg-blue-50" 
              : "border-gray-300 hover:border-legal-blue"
          }`}
          data-testid="dropzone"
        >
          <input {...getInputProps()} data-testid="file-input" />
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            <CloudUpload className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? "Drop files here" : "Drop files here or browse"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Supports PDF, DOC, DOCX, and JPEG files up to 10MB each
          </p>
          <Button 
            className="bg-legal-blue hover:bg-blue-700"
            disabled={isUploading}
            data-testid="choose-files-button"
          >
            {isUploading ? "Uploading..." : "Choose Files"}
          </Button>
        </div>

        {/* File Rejections */}
        {fileRejections.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="file-errors">
            <h4 className="text-sm font-medium text-red-800 mb-2">Upload Errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {fileRejections.map(({ file, errors }, index) => (
                <li key={index}>
                  {file.name}: {errors.map(e => e.message).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Supported File Types */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center" data-testid="supported-pdf">
            <FileText className="w-4 h-4 text-red-500 mr-2" />
            <span>PDF</span>
          </div>
          <div className="flex items-center" data-testid="supported-word">
            <FileText className="w-4 h-4 text-blue-500 mr-2" />
            <span>DOC/DOCX</span>
          </div>
          <div className="flex items-center" data-testid="supported-image">
            <FileImage className="w-4 h-4 text-green-500 mr-2" />
            <span>JPEG/PNG</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
