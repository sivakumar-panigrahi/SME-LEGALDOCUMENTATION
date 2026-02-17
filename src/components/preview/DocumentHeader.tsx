import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DocumentStatusBadge } from "./DocumentStatusBadge";

interface DocumentHeaderProps {
  document: any;
  documentStatus: string;
  onBackToDocuments: () => void;
}

export const DocumentHeader = ({ document, documentStatus, onBackToDocuments }: DocumentHeaderProps) => {
  const getStatusDescription = () => {
    switch (documentStatus) {
      case "draft": return "Ready for company signature";
      case "company_signed": return "Ready to send for client signature";
      case "sent_for_signature": return "Waiting for client to sign";
      case "fully_signed": return "Document is complete and ready for download";
      default: return "Processing document";
    }
  };

  const templateName = document?.template?.name || document?.template_name || 'Document';
  const employeeName = document?.formData?.employeeName || (document?.form_data as any)?.employeeName || '';

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBackToDocuments} className="h-10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">
              {templateName}
            </h1>
            <p className="text-muted-foreground">
              {employeeName ? `for ${employeeName}` : "Document Preview"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DocumentStatusBadge status={documentStatus} />
        </div>
      </div>

      <p className="text-muted-foreground text-sm md:text-base">
        {getStatusDescription()}
      </p>
    </div>
  );
};
