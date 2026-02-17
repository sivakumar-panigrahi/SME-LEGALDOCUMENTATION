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

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <AuthenticatedSidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
