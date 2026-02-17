import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Filter, Plus, Sparkles, Loader2 } from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { DocumentFilters } from "./DocumentFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getStatusLabel } from "@/lib/statusUtils";
import { formatDistanceToNow } from "date-fns";

interface MyDocumentsProps {
  onEditDocument: (doc: any) => void;
  onCreateDocument?: () => void;
}

export const MyDocuments = ({ onEditDocument, onCreateDocument }: MyDocumentsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map(doc => ({
        id: doc.id,
        title: `${doc.template_name} - ${(doc.form_data as any)?.employeeName || 'Untitled'}`,
        type: doc.template_name,
        status: doc.status,
        statusLabel: getStatusLabel(doc.status),
        createdBy: (doc.form_data as any)?.companyName || 'You',
        createdDate: doc.created_at,
        lastModified: formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true }),
        size: '-',
        rawDoc: doc,
      }));
      setDocuments(mapped);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({ title: "Error", description: "Failed to load documents.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDocument = (doc: any) => {
    // Transform to PDFPreview expected format
    const raw = doc.rawDoc;
    const transformed = {
      id: raw.id,
      template: { name: raw.template_name },
      formData: raw.form_data,
      status: raw.status,
      company_signature: raw.company_signature,
      client_signature: raw.client_signature,
    };
    onEditDocument(transformed);
  };

  const handleEditDocument = (doc: any) => {
    if (doc.status === "fully_signed") {
      toast({ title: "Cannot Edit", description: "Fully signed documents cannot be edited.", variant: "destructive" });
      return;
    }
    handleViewDocument(doc);
  };

  const handleDeleteDocument = async (doc: any) => {
    if (doc.status === "fully_signed") {
      toast({ title: "Cannot Delete", description: "Fully signed documents cannot be deleted.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;
      toast({ title: "Deleted", description: `Document has been deleted.` });
      fetchDocuments();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
    }
  };

  const uniqueTypes = [...new Set(documents.map(d => d.type))];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold heading-gradient mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-600" />
              My Documents
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Manage all your legal documents in one place. ({documents.filter(d => d.status === "fully_signed").length} signed)
            </p>
          </div>
          <Button 
            className="btn-gradient-primary w-full sm:w-auto h-12 px-8 shadow-lg hover:shadow-xl"
            onClick={onCreateDocument}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Document
          </Button>
        </div>
      </div>

      <div className="modern-card p-6 mb-6">
        <DocumentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          availableTypes={uniqueTypes}
        />
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="space-y-4 md:space-y-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="animate-scale-in">
              <DocumentCard
                document={doc}
                onView={handleViewDocument}
                onEdit={handleEditDocument}
                onDelete={handleDeleteDocument}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="modern-card border-0 shadow-xl hover-scale hover:shadow-2xl transition-shadow cursor-pointer">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="animate-glow w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "No documents match your filters"
                : "No documents found"
              }
            </h3>
            <p className="text-muted-foreground mb-8">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search criteria"
                : "Create your first document to get started"
              }
            </p>
            <Button className="btn-gradient-primary h-12 px-8" onClick={onCreateDocument}>
              <Plus className="h-5 w-5 mr-2" />
              Create New Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
