import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Copy, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function DocumentGeneration() {
  const [, setLocation] = useLocation();
  const [generatedDocument, setGeneratedDocument] = useState<string>("");
  const [validation, setValidation] = useState<{ isValid: boolean; missingFields: string[] } | null>(null);
  const { toast } = useToast();

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const documentId = urlParams.get('documentId');
  const templateId = urlParams.get('templateId');

  // Generate document on component mount
  useEffect(() => {
    if (documentId && templateId) {
      generateDocument();
    }
  }, [documentId, templateId]);

  const generateDocument = async () => {
    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          extractedInfoId: documentId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const data = await response.json();
      setGeneratedDocument(data.document);
      setValidation(data.validation);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: (error as Error).message || "Failed to generate document",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedDocument);
      toast({
        title: "Copied to clipboard",
        description: "The document has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy document to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-document-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your document is being downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-legal">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4" data-testid="header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="text-legal-blue text-2xl" data-testid="logo-icon" />
            <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">
              Minnesota Legal Document Generator
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-legal-blue rounded-full flex items-center justify-center" data-testid="user-avatar">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="text-sm text-gray-700" data-testid="user-name">John Doe, Esq.</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="page-title">
            Generated Legal Document
          </h2>
          <p className="text-gray-600" data-testid="page-subtitle">
            Review and download your completed legal document
          </p>
        </div>

        {/* Validation Status */}
        {validation && (
          <Card className="mb-6" data-testid="validation-status">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {validation.isValid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Document Complete</p>
                      <p className="text-sm text-green-600">All required fields have been filled</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Missing Information</p>
                      <p className="text-sm text-yellow-600">
                        The following fields need attention: {validation.missingFields.join(', ')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Content */}
        <Card className="mb-6" data-testid="document-content">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900" data-testid="document-title">
                Legal Document
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  data-testid="copy-button"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  data-testid="download-button"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <Textarea
                value={generatedDocument}
                onChange={(e) => setGeneratedDocument(e.target.value)}
                className="min-h-[500px] font-mono text-sm bg-white border-0 resize-none"
                placeholder="Generated document will appear here..."
                data-testid="document-textarea"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setLocation(`/templates?documentId=${documentId}`)}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setLocation('/')}
              data-testid="button-new-document"
            >
              Create New Document
            </Button>
            <Button 
              onClick={handleDownload}
              className="bg-legal-blue hover:bg-blue-700"
              data-testid="button-download-final"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Final Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}