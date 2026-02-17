import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentFilters } from "./DocumentFilters";
import { DocumentCard } from "./DocumentCard";
import { useDocuments } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";

export const MyDocuments = () => {
  const navigate = useNavigate();
  const { documents, loading, deleteDocument } = useDocuments();

  const handleCreateNew = () => {
    // Navigates to the template selection page as per the plan
    navigate("/templates");
  };

  const handleView = (id: string) => {
    navigate(`/preview/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  // Note: The following simple implementation follows the user's requested snippet.
  // In a full implementation, we'd add back search and filter state here.

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold heading-gradient mb-2">My Documents</h1>
          <p className="text-muted-foreground text-lg">
            Manage and track your legal documentation.
          </p>
        </div>
        <Button onClick={handleCreateNew} className="btn-gradient-primary h-12 px-8 shadow-lg hover:shadow-xl gap-2">
          <Plus className="h-5 w-5" />
          Create New Document
        </Button>
      </div>

      <div className="modern-card p-6 mb-8">
        <DocumentFilters />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loading ? (
          // Show loading state while fetching from Supabase
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="modern-card p-6 space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
            </div>
          ))
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.id} className="animate-scale-in">
              <DocumentCard
                document={{
                  id: doc.id,
                  title: doc.template_name || "Untitled Document",
                  type: doc.document_type || "Legal",
                  status: doc.status,
                  date: new Date(doc.updated_at).toLocaleDateString(),
                  createdBy: (doc.form_data as any)?.companyName || "You",
                }}
                onView={() => handleView(doc.id)}
                onEdit={() => handleEdit(doc.id)}
                onDelete={() => deleteDocument(doc.id)}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center modern-card border-dashed">
            <p className="text-xl text-muted-foreground mb-6">No documents found. Create your first one!</p>
            <Button onClick={handleCreateNew} className="btn-gradient-primary h-12 px-8">
              <Plus className="h-5 w-5 mr-2" />
              Create First Document
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
