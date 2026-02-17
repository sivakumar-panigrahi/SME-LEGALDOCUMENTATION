import { useState } from "react";
import { AuthenticatedSidebar } from "@/components/layout/AuthenticatedSidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { TemplateLibrary } from "@/components/templates/TemplateLibrary";
import { MyDocuments } from "@/components/documents/MyDocuments";
import { DocumentForm } from "@/components/forms/DocumentForm";
import { PDFPreview } from "@/components/preview/PDFPreview";
import { ClauseLibrary } from "@/components/clauses/ClauseLibrary";
import { Approvals } from "@/components/approvals/Approvals";
import { Settings } from "@/components/settings/Settings";

export const AuthenticatedIndex = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "templates":
        return (
          <TemplateLibrary
            onSelectTemplate={(template) => {
              setSelectedTemplate(template);
              setActiveView("form");
            }}
          />
        );
      case "documents":
        return <MyDocuments />;
      case "form":
        return (
          <DocumentForm
            template={selectedTemplate}
            onPreview={(doc) => {
              setCurrentDocument(doc);
              setActiveView("preview");
            }}
          />
        );
      case "preview":
        return (
          <PDFPreview
            document={currentDocument}
            onEdit={() => setActiveView("form")}
            onBackToDocuments={() => setActiveView("documents")}
          />
        );
      case "approvals":
        return <Approvals />;
      case "clauses":
        return <ClauseLibrary />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Add 'fixed' position to the background container to stop it from moving with content
  <div className="min-h-screen flex w-full relative overflow-hidden bg-background/50">
    {/* Background Blobs - Ensure pointer-events-none is strictly applied */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
    </div>

    <AuthenticatedSidebar activeView={activeView} onViewChange={setActiveView} />

    {/* Ensure main content is clearly layered above background */}
    <main className="flex-1 overflow-y-auto relative z-10 h-screen">
      <div className="animate-fade-in p-6">
        {renderContent()}
      </div>
    </main>
  </div>
  );
};
