import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, FileText, Scale, Gavel, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LegalTemplate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TemplateSelectionProps {
  documentId?: string;
}

export default function TemplateSelection({ documentId }: TemplateSelectionProps) {
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const { toast } = useToast();

  const { data: templatesResponse, isLoading } = useQuery<{ templates: LegalTemplate[] }>({
    queryKey: ['/api/templates'],
  });

  const generateMutation = useMutation({
    mutationFn: async ({ templateId, extractedInfoId }: { templateId: string; extractedInfoId: string }) => {
      const response = await apiRequest('POST', '/api/documents/generate', {
        templateId,
        extractedInfoId
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Navigate to document generation page with the generated document
      setLocation(`/generate?documentId=${documentId}&templateId=${selectedTemplate?.id}`);
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate document",
        variant: "destructive",
      });
    },
  });

  const allTemplates = templatesResponse?.templates || [];
  
  // Filter templates based on selected category and type
  const templates = allTemplates.filter(template => {
    const categoryMatch = selectedCategory === "all" || template.category === selectedCategory;
    const typeMatch = selectedType === "all" || template.type === selectedType;
    return categoryMatch && typeMatch;
  });

  // Get unique categories and types for filters
  const categories = Array.from(new Set(allTemplates.map(t => t.category)));
  const types = Array.from(new Set(allTemplates.map(t => t.type)));

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'motion':
        return <Scale className="w-6 h-6 text-blue-600" />;
      case 'petition':
        return <FileText className="w-6 h-6 text-green-600" />;
      default:
        return <Gavel className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'family':
        return 'bg-pink-100 text-pink-800';
      case 'civil':
        return 'bg-blue-100 text-blue-800';
      case 'criminal':
        return 'bg-red-100 text-red-800';
      case 'probate':
        return 'bg-purple-100 text-purple-800';
      case 'federal-civil':
        return 'bg-indigo-100 text-indigo-800';
      case 'federal-criminal':
        return 'bg-orange-100 text-orange-800';
      case 'federal-attorney':
        return 'bg-green-100 text-green-800';
      case 'protective-order':
        return 'bg-yellow-100 text-yellow-800';
      case 'housing':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContinue = () => {
    if (!selectedTemplate || !documentId) return;
    
    generateMutation.mutate({
      templateId: selectedTemplate.id,
      extractedInfoId: documentId
    });
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
            Select Legal Template
          </h2>
          <p className="text-gray-600 mb-6" data-testid="page-subtitle">
            Choose the appropriate legal document template for your case
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory} data-testid="category-filter">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType} data-testid="type-filter">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="outline" className="ml-2" data-testid="template-count">
              {templates.length} template{templates.length !== 1 ? 's' : ''} found
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse" data-testid={`template-skeleton-${i}`}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTemplate?.id === template.id
                    ? "ring-2 ring-legal-blue bg-blue-50"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedTemplate(template)}
                data-testid={`template-${template.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTemplateIcon(template.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900" data-testid={`template-name-${template.id}`}>
                          {template.name}
                        </h3>
                        <Badge className={getCategoryColor(template.category)} data-testid={`template-category-${template.id}`}>
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Required Fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {(template.requiredFields as string[]).slice(0, 3).map((field: string) => (
                        <Badge key={field} variant="outline" className="text-xs" data-testid={`field-${field}`}>
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                      ))}
                      {(template.requiredFields as string[]).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(template.requiredFields as string[]).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Type: {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {templates.length === 0 && !isLoading && (
          <Card data-testid="no-templates">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No templates available</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedTemplate || generateMutation.isPending}
            data-testid="button-continue"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Document'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}