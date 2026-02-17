
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Mail, PenTool } from "lucide-react";

interface DocumentStatusBadgeProps {
  status: string;
}

export const DocumentStatusBadge = ({ status }: DocumentStatusBadgeProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "company_signed":
        return "default";
      case "sent_for_signature":
        return "outline";
      case "fully_signed":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "draft":
        return <Clock className="h-3 w-3" />;
      case "company_signed":
        return <PenTool className="h-3 w-3" />;
      case "sent_for_signature":
        return <Mail className="h-3 w-3" />;
      case "fully_signed":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Badge variant={getStatusBadgeVariant(status)} className="flex items-center space-x-1">
      {getStatusIcon()}
      <span>{status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
    </Badge>
  );
};
