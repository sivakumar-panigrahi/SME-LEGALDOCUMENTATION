import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  Send,
  Plus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getStatusLabel, getStatusVariant } from "@/lib/statusUtils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    completed: 0
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch all documents for the user to calculate stats
        const { data: allDocs, error: docsError } = await supabase
          .from('documents')
          .select('status, id, template_name, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (docsError) throw docsError;

        if (allDocs) {
          // Calculate stats from real data
          setStats({
            total: allDocs.length,
            pending: allDocs.filter(d => d.status === 'draft').length,
            sent: allDocs.filter(d => d.status === 'sent_for_signature' || d.status === 'company_signed').length,
            completed: allDocs.filter(d => d.status === 'fully_signed').length
          });

          // Take the 5 most recent documents
          setRecentDocs(allDocs.slice(0, 5));
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "User";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your documents.
          </p>
        </div>
        <Button onClick={() => navigate("/templates")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Documents" value={stats.total} icon={<FileText className="h-4 w-4" />} loading={loading} />
        <StatCard title="Pending Review" value={stats.pending} icon={<Clock className="h-4 w-4" />} loading={loading} />
        <StatCard title="Sent for Signing" value={stats.sent} icon={<Send className="h-4 w-4" />} loading={loading} />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="h-4 w-4" />} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/documents")} className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentDocs.length > 0 ? (
              <div className="space-y-4">
                {recentDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/preview/${doc.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.template_name || "Untitled Document"}</p>
                        <p className="text-sm text-muted-foreground">Updated {new Date(doc.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(doc.status)}>
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent documents found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}

const StatCard = ({ title, value, icon, loading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);
