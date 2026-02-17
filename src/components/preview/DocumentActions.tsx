
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Download, CheckCircle, Loader2 } from "lucide-react";
import { generatePDFContent } from "./utils/pdfGenerator";

interface DocumentActionsProps {
  document: any;
  documentStatus: string;
  companySignature: string;
  onEdit: () => void;
  isDownloading: boolean;
  setIsDownloading: (loading: boolean) => void;
  setDocumentStatus: (status: string) => void;
}

export const DocumentActions = ({ 
  document, 
  documentStatus, 
  companySignature, 
  onEdit, 
  isDownloading, 
  setIsDownloading,
  setDocumentStatus 
}: DocumentActionsProps) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const content = generatePDFContent(document, documentStatus, companySignature);
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = globalThis.document.createElement('a');
      a.href = url;
      a.download = `${document.template.name}-${document.formData.employeeName || 'document'}-${documentStatus.replace(/\s+/g, '-')}.html`;
      globalThis.document.body.appendChild(a);
      a.click();
      globalThis.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: documentStatus === "fully_signed" 
          ? "Your signed document has been downloaded successfully." 
          : "Your document is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const simulateClientSigning = async () => {
    setIsDownloading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDocumentStatus("fully_signed");
      
      toast({
        title: "Document Fully Executed",
        description: "Both parties have signed the document. It's now legally binding and ready for download.",
      });
    } catch (error) {
      toast({
        title: "Signing Error",
        description: "There was an error completing the signature process.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={onEdit} variant="outline" className="w-full h-11">
        <Edit className="h-4 w-4 mr-2" />
        Edit Document
      </Button>
      
      <Button 
        onClick={handleDownload} 
        variant="outline" 
        className="w-full h-11"
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {documentStatus === "fully_signed" ? "Download Signed PDF" : "Download PDF"}
      </Button>
      
      {documentStatus === "sent_for_signature" && (
        <Button 
          onClick={simulateClientSigning} 
          variant="outline"
          className="w-full h-11"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Simulate Client Signing
        </Button>
      )}
      
      {documentStatus === "fully_signed" && (
        <Button 
          onClick={handleDownload} 
          className="w-full bg-green-600 hover:bg-green-700 h-11"
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download Signed Document
        </Button>
      )}
    </div>
  );
};
