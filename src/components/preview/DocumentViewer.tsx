
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { generatePDFContent } from "./utils/pdfGenerator";

interface DocumentViewerProps {
  document: any;
  documentStatus: string;
  companySignature: string;
}

export const DocumentViewer = ({ document, documentStatus, companySignature }: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Document Preview</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="h-9 w-9"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[40px] text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="h-9 w-9"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="h-9 w-9"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="border rounded-lg p-4 md:p-6 bg-background shadow-sm overflow-auto max-h-[70vh]"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          dangerouslySetInnerHTML={{ __html: generatePDFContent(document, documentStatus, companySignature) }}
        />
      </CardContent>
    </Card>
  );
};
