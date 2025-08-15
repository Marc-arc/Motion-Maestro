import { formatDistanceToNow } from "date-fns";
import { FileText, FileImage, Eye, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Document } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentListProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  selectedDocument: Document | null;
}

export function DocumentList({ documents, onDocumentSelect, selectedDocument }: DocumentListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      await apiRequest('DELETE', `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const getFileIcon = (fileType: string) => {
    if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
      return <FileImage className="w-5 h-5 text-green-600" />;
    }
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const getFileIconBg = (fileType: string) => {
    if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
      return "bg-green-100";
    }
    if (fileType === '.pdf') {
      return "bg-red-100";
    }
    return "bg-blue-100";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-legal-success text-white" data-testid={`status-processed`}>Processed</Badge>;
      case 'processing':
        return (
          <Badge variant="secondary" className="flex items-center gap-1" data-testid={`status-processing`}>
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing...
          </Badge>
        );
      case 'error':
        return <Badge variant="destructive" data-testid={`status-error`}>Error</Badge>;
      default:
        return <Badge variant="outline" data-testid={`status-uploaded`}>Uploaded</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <Card className="mb-6" data-testid="no-documents">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No documents uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6" data-testid="document-list">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="document-list-title">
          Uploaded Documents ({documents.length})
        </h3>
        
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedDocument?.id === document.id
                  ? "bg-blue-50 border-legal-blue"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
              onClick={() => onDocumentSelect(document)}
              data-testid={`document-item-${document.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileIconBg(document.fileType)}`}>
                  {getFileIcon(document.fileType)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900" data-testid={`document-name-${document.id}`}>
                    {document.originalName}
                  </p>
                  <p className="text-xs text-gray-500" data-testid={`document-info-${document.id}`}>
                    {formatFileSize(document.fileSize)} • Uploaded {formatDistanceToNow(new Date(document.uploadedAt))} ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(document.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement preview functionality
                  }}
                  data-testid={`preview-button-${document.id}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(document.id);
                  }}
                  disabled={deleteMutation.isPending}
                  data-testid={`delete-button-${document.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
