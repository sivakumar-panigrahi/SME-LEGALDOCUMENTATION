
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentInfoProps {
  document: any;
}

export const DocumentInfo = ({ document }: DocumentInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-medium">Employee:</span> {document.form_data?.employeeName || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Company:</span> {document.form_data?.companyName || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Position:</span> {document.form_data?.position || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Created:</span> {new Date(document.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
