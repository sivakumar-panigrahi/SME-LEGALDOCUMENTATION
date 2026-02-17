
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePDFContent } from "@/components/preview/utils/pdfGenerator";

interface DownloadSectionProps {
  document: any;
}

export const DownloadSection = ({ document }: DownloadSectionProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Document</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={downloadPDF} variant="outline" className="w-full">
          Download Current Version
        </Button>
      </CardContent>
    </Card>
  );
};
