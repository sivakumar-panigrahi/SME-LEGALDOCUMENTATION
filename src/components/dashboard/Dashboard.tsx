import { useState, useEffect } from "react";
import { Plus, FileText, Clock, CheckCircle, Send, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getStatusLabel, getStatusColor } from "@/lib/statusUtils";
import { formatDistanceToNow } from "date-fns";

interface DashboardProps {
  onCreateDocument: () => void;
  onViewChange: (view: string) => void;
}

export const Dashboard = ({ onCreateDocument, onViewChange }: DashboardProps) => {
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);
        if (error) throw error;
        setDocuments(data || []);
      } catch (e) {
        console.error('Error fetching dashboard docs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user]);

  const stats = {
    total: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    sent: documents.filter(d => d.status === 'sent_for_signature' || d.status === 'company_signed').length,
    completed: documents.filter(d => d.status === 'fully_signed').length,
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "company_signed": case "sent_for_signature": return <Send className="h-4 w-4 text-blue-500" />;
      case "fully_signed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto overflow-hidden">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 break-words">
          Hi {displayName}, ready to automate your next document?
        </h1>
        <p className="text-lg text-muted-foreground">
          Create professional legal documents in minutes with our smart templates.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { label: "Total Documents", value: stats.total, icon: <FileText className="h-6 w-6 text-blue-500" /> },
          { label: "Drafts", value: stats.draft, icon: <Clock className="h-6 w-6 text-yellow-500" /> },
          { label: "Sent / Pending", value: stats.sent, icon: <Send className="h-6 w-6 text-blue-500" /> },
          { label: "Completed", value: stats.completed, icon: <CheckCircle className="h-6 w-6 text-green-500" /> },
        ].map((s) => (
          <Card key={s.label} className="overflow-hidden hover-scale hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">{s.icon}</div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{s.label}</p>
                  <p className="text-xl sm:text-2xl font-semibold text-foreground">{loading ? '—' : s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Documents</h2>
            <Button variant="outline" size="sm" onClick={() => onViewChange('documents')}>View All</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover-scale hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground mb-1 truncate">
                          {doc.template_name} - {(doc.form_data as any)?.employeeName || 'Untitled'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 truncate">{doc.template_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(doc.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(doc.status)}`}>
                            {getStatusLabel(doc.status)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            onViewChange('documents');
                          }}>View</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="hover-scale hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-6">Let's fix that.</p>
                <Button onClick={onCreateDocument}>
                  <Plus className="h-4 w-4 mr-2" />Start New Document
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="space-y-4">
            {[
              { label: "Create Document", desc: "Start with a template", icon: <Plus className="h-6 w-6 text-blue-500" />, action: 'templates' },
              { label: "Browse Clauses", desc: "Manage clause library", icon: <BookOpen className="h-6 w-6 text-green-500" />, action: 'clauses' },
              { label: "My Documents", desc: "View all documents", icon: <CheckCircle className="h-6 w-6 text-purple-500" />, action: 'documents' },
            ].map((item) => (
              <Card key={item.action} className="hover-scale hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewChange(item.action)}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="ml-4">
                      <h3 className="font-medium text-foreground">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
