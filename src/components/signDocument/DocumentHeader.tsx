import { Badge } from "@/components/ui/badge";

interface DocumentHeaderProps {
  document: any;
}

export const DocumentHeader = ({ document }: DocumentHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'company_signed': return 'default';
      case 'sent_for_signature': return 'outline';
      case 'fully_signed': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {document.template_name || 'Legal Document'}
          </h1>
          <p className="text-muted-foreground mt-1">Document ID: {document.id}</p>
        </div>
        <Badge variant={getStatusColor(document.status)}>
          {/* Using regex with global flag /_/g to replace ALL underscores with spaces */}
          {document.status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>
    </div>
  );
};
