import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, Edit, Download, Trash2, CheckCircle, Clock, PenTool, Mail, MoreVertical
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStatusLabel, getStatusBadgeClass } from "@/lib/statusUtils";

interface DocumentCardProps {
  document: any;
  onView: (doc: any) => void;
  onEdit: (doc: any) => void;
  onDelete: (doc: any) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "draft": return <Clock className="h-3 w-3 text-amber-600" />;
    case "company_signed": return <PenTool className="h-3 w-3 text-blue-600" />;
    case "sent_for_signature": return <Mail className="h-3 w-3 text-orange-600" />;
    case "fully_signed": return <CheckCircle className="h-3 w-3 text-emerald-600" />;
    default: return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
};

export const DocumentCard = ({ document, onView, onEdit, onDelete }: DocumentCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const label = getStatusLabel(document.status);
  const isSigned = document.status === "fully_signed";

  const handleDownload = () => {
    toast({ title: "Download Started", description: `"${document.title}" is being downloaded.` });
  };

  const handleEdit = () => {
    if (isSigned) {
      toast({ title: "Cannot Edit", description: "Fully signed documents cannot be edited.", variant: "destructive" });
      return;
    }
    onEdit(document);
  };

  const handleDelete = async () => {
    if (isSigned) {
      toast({ title: "Cannot Delete", description: "Fully signed documents cannot be deleted.", variant: "destructive" });
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(document);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="modern-card border-0 shadow-lg hover:shadow-2xl interactive-hover">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h3 className="font-bold text-foreground truncate text-lg md:text-xl">
                {document.title}
              </h3>
              <div className="flex items-center gap-2 self-start">
                {getStatusIcon(document.status)}
                <Badge className={`${getStatusBadgeClass(document.status)} text-sm px-3 py-1 font-medium shadow-sm`}>
                  {label}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="truncate font-medium">{document.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="truncate">By {document.createdBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="truncate">{document.lastModified}</span>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onView(document)} className="h-10 px-4">
              <Eye className="h-4 w-4 mr-2" /><span className="hidden md:inline">View</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEdit} disabled={isSigned} className="h-10 px-4">
              <Edit className="h-4 w-4 mr-2" /><span className="hidden md:inline">Edit</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="h-10 px-4">
              <Download className="h-4 w-4 mr-2" /><span className="hidden md:inline">Download</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive h-10 px-4" onClick={handleDelete} disabled={isSigned || isDeleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(document)}>
                  <Eye className="h-4 w-4 mr-2" />View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} disabled={isSigned}>
                  <Edit className="h-4 w-4 mr-2" />Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={isSigned || isDeleting} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
