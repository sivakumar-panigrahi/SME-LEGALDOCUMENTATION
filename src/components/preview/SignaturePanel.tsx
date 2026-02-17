
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenTool, Loader2 } from "lucide-react";

interface SignaturePanelProps {
  companySignature: string;
  setCompanySignature: (signature: string) => void;
  onSign: () => void;
  isLoading: boolean;
  documentLoading: boolean;
}

export const SignaturePanel = ({ 
  companySignature, 
  setCompanySignature, 
  onSign, 
  isLoading, 
  documentLoading 
}: SignaturePanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PenTool className="h-5 w-5" />
          <span>Company Signature</span>
        </CardTitle>
        <CardDescription>
          Add company signature to proceed with document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companySignature">Authorized Signatory</Label>
          <Input
            id="companySignature"
            placeholder="Enter full name"
            value={companySignature}
            onChange={(e) => setCompanySignature(e.target.value)}
            className="h-11"
          />
        </div>
        <Button 
          onClick={onSign} 
          className="w-full h-11"
          disabled={isLoading || documentLoading || !companySignature.trim()}
        >
          {isLoading || documentLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing & Sending...
            </>
          ) : (
            <>
              <PenTool className="h-4 w-4 mr-2" />
              Sign & Send to Client
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          After signing, document will be automatically sent to the client for their signature.
        </p>
      </CardContent>
    </Card>
  );
};
