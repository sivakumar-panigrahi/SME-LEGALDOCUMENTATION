
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePDFContent } from "@/components/preview/utils/pdfGenerator";

interface DocumentPreviewProps {
  document: any;
}

export const DocumentPreview = ({ document }: DocumentPreviewProps) => {
  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border border-border rounded-lg p-4 bg-card min-h-[600px]"
            dangerouslySetInnerHTML={{ 
              __html: generatePDFContent(document, document.status, document.company_signature || "") 
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
