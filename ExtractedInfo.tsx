import { useState } from "react";
import { Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExtractedInformation } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExtractedInfoProps {
  extractedInfo: ExtractedInformation;
}

export function ExtractedInfo({ extractedInfo }: ExtractedInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(extractedInfo);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<ExtractedInformation>) => {
      const response = await apiRequest('PATCH', `/api/extracted-info/${extractedInfo.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', extractedInfo.documentId, 'extracted-info'] });
      setIsEditing(false);
      toast({
        title: "Information updated",
        description: "The extracted information has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update information",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(editedInfo);
  };

  const handleCancel = () => {
    setEditedInfo(extractedInfo);
    setIsEditing(false);
  };

  const InfoField = ({ label, value, field }: { label: string; value: string | null; field: keyof ExtractedInformation }) => (
    <div>
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Label>
      {isEditing ? (
        <Input
          value={editedInfo[field] as string || ''}
          onChange={(e) => setEditedInfo(prev => ({ ...prev, [field]: e.target.value }))}
          data-testid={`input-${field}`}
        />
      ) : (
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-sm text-gray-900" data-testid={`text-${field}`}>
            {value || '[Not provided]'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Card className="mt-6" data-testid="extracted-info">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900" data-testid="extracted-info-title">
            Extracted Information
          </h3>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              data-testid="edit-info-button"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Information
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                data-testid="cancel-edit-button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                data-testid="save-edit-button"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Case Information
              </Label>
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                <InfoField 
                  label="Case Number" 
                  value={extractedInfo.caseNumber} 
                  field="caseNumber" 
                />
                <InfoField 
                  label="Court" 
                  value={extractedInfo.court} 
                  field="court" 
                />
                <InfoField 
                  label="Judge" 
                  value={extractedInfo.judge} 
                  field="judge" 
                />
              </div>
            </div>

            <InfoField 
              label="Petitioner Name" 
              value={extractedInfo.petitionerName} 
              field="petitionerName" 
            />
            <InfoField 
              label="Petitioner Address" 
              value={extractedInfo.petitionerAddress} 
              field="petitionerAddress" 
            />
            <InfoField 
              label="Petitioner Phone" 
              value={extractedInfo.petitionerPhone} 
              field="petitionerPhone" 
            />
          </div>

          <div className="space-y-4">
            <InfoField 
              label="Respondent Name" 
              value={extractedInfo.respondentName} 
              field="respondentName" 
            />
            <InfoField 
              label="Respondent Address" 
              value={extractedInfo.respondentAddress} 
              field="respondentAddress" 
            />
            <InfoField 
              label="Respondent Phone" 
              value={extractedInfo.respondentPhone} 
              field="respondentPhone" 
            />

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Key Dates
              </Label>
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                <InfoField 
                  label="Marriage Date" 
                  value={extractedInfo.marriageDate} 
                  field="marriageDate" 
                />
                <InfoField 
                  label="Separation Date" 
                  value={extractedInfo.separationDate} 
                  field="separationDate" 
                />
                <InfoField 
                  label="Filing Date" 
                  value={extractedInfo.filingDate} 
                  field="filingDate" 
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
