
import { useParams } from "react-router-dom";
import { useSignDocument } from "@/hooks/useSignDocument";
import { DocumentHeader } from "@/components/signDocument/DocumentHeader";
import { DocumentPreview } from "@/components/signDocument/DocumentPreview";
import { DocumentInfo } from "@/components/signDocument/DocumentInfo";
import { SignatureSection } from "@/components/signDocument/SignatureSection";
import { DownloadSection } from "@/components/signDocument/DownloadSection";
import { LoadingState } from "@/components/signDocument/LoadingState";
import { NotFoundState } from "@/components/signDocument/NotFoundState";

export const SignDocument = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const { document, setDocument, loading } = useSignDocument(documentId);

  if (loading) {
    return <LoadingState />;
  }

  if (!document) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <DocumentHeader document={document} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DocumentPreview document={document} />

          <div className="space-y-6">
            <DocumentInfo document={document} />
            
            <SignatureSection 
              document={document} 
              setDocument={setDocument} 
              documentId={documentId!} 
            />

            <DownloadSection document={document} />
          </div>
        </div>
      </div>
    </div>
  );
};
