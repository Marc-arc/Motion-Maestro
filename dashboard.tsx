import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Gavel, HelpCircle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { FileUpload } from "@/components/FileUpload";
import { DocumentList } from "@/components/DocumentList";
import { ExtractedInfo } from "@/components/ExtractedInfo";
import { Button } from "@/components/ui/button";
import { Document, ExtractedInformation } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const { data: documentsResponse, refetch: refetchDocuments } = useQuery<{ documents: Document[] }>({
    queryKey: ['/api/documents'],
  });

  const { data: extractedInfoResponse } = useQuery<{ extractedInfo: ExtractedInformation }>({
    queryKey: ['/api/documents', selectedDocument?.id, 'extracted-info'],
    enabled: !!selectedDocument && selectedDocument.status === 'processed',
  });

  const documents = documentsResponse?.documents || [];
  const extractedInfo = extractedInfoResponse?.extractedInfo;

  const handleFileUploadSuccess = () => {
    refetchDocuments();
  };

  const handleContinueToTemplateSelection = () => {
    if (selectedDocument) {
      setLocation(`/templates?documentId=${selectedDocument.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-legal">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4" data-testid="header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Gavel className="text-legal-blue text-2xl" data-testid="logo-icon" />
            <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">
              Minnesota Legal Document Generator
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" data-testid="help-button">
              <HelpCircle className="text-lg" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-legal-blue rounded-full flex items-center justify-center" data-testid="user-avatar">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="text-sm text-gray-700" data-testid="user-name">John Doe, Esq.</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        <Sidebar currentStep={currentStep} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" data-testid="main-content">
          <div className="p-8">
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={currentStep} />

            {/* Upload Section */}
            <FileUpload onUploadSuccess={handleFileUploadSuccess} />

            {/* Uploaded Files */}
            <DocumentList 
              documents={documents} 
              onDocumentSelect={setSelectedDocument}
              selectedDocument={selectedDocument}
            />

            {/* Extracted Information Preview */}
            {selectedDocument && selectedDocument.status === 'processed' && extractedInfo && (
              <ExtractedInfo extractedInfo={extractedInfo} />
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline"
                data-testid="button-back"
              >
                <span className="mr-2">←</span>
                Back
              </Button>
              <Button 
                onClick={handleContinueToTemplateSelection}
                disabled={!selectedDocument || selectedDocument.status !== 'processed'}
                data-testid="button-continue"
              >
                Continue to Template Selection
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
