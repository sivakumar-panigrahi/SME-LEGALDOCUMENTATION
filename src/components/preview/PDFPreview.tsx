
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentViewer } from "./DocumentViewer";
import { SignaturePanel } from "./SignaturePanel";
import { DocumentActions } from "./DocumentActions";

interface PDFPreviewProps {
  document: any;
  onEdit: () => void;
  onBackToDocuments: () => void;
}

export const PDFPreview = ({ document, onEdit, onBackToDocuments }: PDFPreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [documentStatus, setDocumentStatus] = useState(document?.status || "draft");
  const [companySignature, setCompanySignature] = useState("");
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(document?.id || null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { saveDocument, updateDocumentStatus, sendDocumentForSignature, loading: documentLoading } = useDocuments();

  const handleCompanySign = async () => {
    if (!companySignature.trim()) {
      toast({
        title: "Signature Required",
        description: "Please provide a company signature before signing.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let documentId = currentDocumentId;
      
      // Save document first if not already saved
      if (!documentId) {
        const docData = {
          template_name: document.template?.name || 'Unknown Template',
          form_data: document.formData,
          status: 'draft' as const,
        };
        
        documentId = await saveDocument(docData);
        if (documentId) {
          setCurrentDocumentId(documentId);
        }
      }

      if (documentId) {
        // Update document with company signature
        const success = await updateDocumentStatus(
          documentId, 
          'company_signed', 
          companySignature
        );
        
        if (success) {
          setDocumentStatus('company_signed');
          
          // Auto-send to client
          const clientEmail = document.formData?.employeeEmail;
          const clientName = document.formData?.employeeName;
          const companyName = document.formData?.companyName;
          
          if (clientEmail && clientName && companyName) {
            const emailSuccess = await sendDocumentForSignature(
              documentId,
              clientEmail,
              clientName,
              companyName,
              document.template?.name || 'Legal Document'
            );
            
            if (emailSuccess) {
              setDocumentStatus('sent_for_signature');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error signing document:', error);
      toast({
        title: "Error",
        description: "Failed to sign document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <DocumentHeader 
          document={document} 
          documentStatus={documentStatus} 
          onBackToDocuments={onBackToDocuments} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <DocumentViewer 
              document={document} 
              documentStatus={documentStatus} 
              companySignature={companySignature} 
            />
          </div>

          {/* Actions Panel */}
          <div className="space-y-4 md:space-y-6">
            <SignaturePanel 
              companySignature={companySignature}
              setCompanySignature={setCompanySignature}
              onSign={handleCompanySign}
              isLoading={isLoading}
              documentLoading={documentLoading}
            />

            <DocumentActions 
              document={document}
              documentStatus={documentStatus}
              companySignature={companySignature}
              onEdit={onEdit}
              isDownloading={isDownloading}
              setIsDownloading={setIsDownloading}
              setDocumentStatus={setDocumentStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
