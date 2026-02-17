
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { generatePDFContent } from "@/components/preview/utils/pdfGenerator";
import { useSearchParams } from "react-router-dom";

interface SignatureSectionProps {
  document: any;
  setDocument: (doc: any) => void;
  documentId: string;
}

export const SignatureSection = ({ document, setDocument, documentId }: SignatureSectionProps) => {
  const [signing, setSigning] = useState(false);
  const [clientSignature, setClientSignature] = useState("");
  const { updateDocumentStatus, signDocumentByToken } = useDocuments();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const isAlreadySigned = document.status === 'fully_signed';
  const canSign = document.can_sign !== undefined ? document.can_sign : (document.status === 'sent_for_signature' || document.status === 'company_signed');

  const handleClientSign = async () => {
    if (!clientSignature.trim()) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature before signing.",
        variant: "destructive"
      });
      return;
    }

    setSigning(true);
    try {
      const token = searchParams.get('token');
      let success = false;

      if (token) {
        // Use token-based signing for public access
        success = await signDocumentByToken(token, clientSignature);
      } else {
        // Use regular signing for authenticated users
        success = await updateDocumentStatus(
          documentId,
          'fully_signed',
          clientSignature
        );
      }

      if (success) {
        setDocument((prev: any) => ({
          ...prev,
          status: 'fully_signed',
          client_signature: clientSignature,
          updated_at: new Date().toISOString()
        }));

        toast({
          title: "Document Signed",
          description: "Thank you! The document has been successfully signed.",
        });
      } else {
        throw new Error('Signing failed');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      toast({
        title: "Error",
        description: "Failed to sign document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSigning(false);
    }
  };

  const downloadPDF = () => {
    const pdfContent = generatePDFContent(document, document.status, document.company_signature || "");
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = globalThis.document.createElement('a');
    a.href = url;
    a.download = `${document.template_name || 'document'}-${document.id}.html`;
    globalThis.document.body.appendChild(a);
    a.click();
    globalThis.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isAlreadySigned) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Document Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This document has been fully signed by both parties.
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Client Signed:</span> {document.client_signature}
            </div>
            <div>
              <span className="font-medium">Signed Date:</span> {new Date(document.updated_at).toLocaleString()}
            </div>
          </div>
          <Button onClick={downloadPDF} className="w-full mt-4">
            Download Signed Document
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (canSign) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Signature Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="clientSignature" className="block text-sm font-medium text-foreground mb-2">
              Your Digital Signature
            </label>
            <Input
              id="clientSignature"
              type="text"
              placeholder="Type your full name"
              value={clientSignature}
              onChange={(e) => setClientSignature(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleClientSign}
            disabled={signing || !clientSignature.trim()}
            className="w-full"
          >
            {signing ? 'Signing...' : 'Sign Document'}
          </Button>
          <p className="text-xs text-muted-foreground">
            By signing this document, you agree to all terms and conditions outlined above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Company Signature</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This document is waiting for the company to sign before you can proceed.
        </p>
      </CardContent>
    </Card>
  );
};
