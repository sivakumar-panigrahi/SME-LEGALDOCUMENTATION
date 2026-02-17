import { CheckCircle, Clock, XCircle, FileText, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const mockApprovals = [
  {
    id: "1",
    documentTitle: "Employment Contract - John Doe",
    requester: "Sarah Johnson",
    requestDate: "2024-01-15",
    status: "pending",
    priority: "high",
    type: "contract"
  },
  {
    id: "2", 
    documentTitle: "NDA - Tech Partnership",
    requester: "Mike Chen",
    requestDate: "2024-01-14",
    status: "pending",
    priority: "medium",
    type: "agreement"
  },
  {
    id: "3",
    documentTitle: "Lease Agreement Amendment",
    requester: "Anna Smith",
    requestDate: "2024-01-13", 
    status: "approved",
    priority: "low",
    type: "amendment"
  },
  {
    id: "4",
    documentTitle: "Service Contract - Vendor XYZ",
    requester: "Robert Davis",
    requestDate: "2024-01-12",
    status: "rejected",
    priority: "medium",
    type: "contract"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    case "approved":
      return "bg-green-500/10 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-500/10 text-red-700 border-red-200";
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500/10 text-red-700 border-red-200";
    case "medium":
      return "bg-orange-500/10 text-orange-700 border-orange-200";
    case "low":
      return "bg-blue-500/10 text-blue-700 border-blue-200";
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const Approvals = () => {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState(mockApprovals);
  
  const pendingApprovals = approvals.filter(approval => approval.status === "pending");
  const completedApprovals = approvals.filter(approval => approval.status !== "pending");

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === id 
        ? { ...approval, status: "approved" }
        : approval
    ));
    toast({
      title: "Document Approved",
      description: "The document has been successfully approved.",
    });
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === id 
        ? { ...approval, status: "rejected" }
        : approval
    ));
    toast({
      title: "Document Rejected",
      description: "The document has been rejected.",
      variant: "destructive"
    });
  };

  const handleReview = (id: string) => {
    const approval = approvals.find(a => a.id === id);
    toast({
      title: "Opening Document",
      description: `Reviewing: ${approval?.documentTitle}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold heading-gradient">Document Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve pending document requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover-scale hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-gray-600">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-600">Documents approved</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-scale hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total This Week</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockApprovals.length}</div>
            <p className="text-xs text-gray-600">All requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
        {pendingApprovals.length === 0 ? (
          <Card className="glass-card hover-scale hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pending approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <Card key={approval.id} className="glass-card hover-scale hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{approval.documentTitle}</h3>
                        <Badge className={getPriorityColor(approval.priority)}>
                          {approval.priority} priority
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Requested by {approval.requester}</span>
                        </div>
                        <span>•</span>
                        <span>{approval.requestDate}</span>
                        <span>•</span>
                        <span className="capitalize">{approval.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReview(approval.id)}
                      >
                        Review
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(approval.id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleReject(approval.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Decisions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Decisions</h2>
        <div className="space-y-3">
          {completedApprovals.map((approval) => (
            <Card key={approval.id} className="glass-card hover-scale hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <h3 className="font-medium text-gray-700">{approval.documentTitle}</h3>
                      <Badge className={getStatusColor(approval.status)}>
                        {getStatusIcon(approval.status)}
                        <span className="ml-1 capitalize">{approval.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{approval.requester}</span>
                      </div>
                      <span>•</span>
                      <span>{approval.requestDate}</span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="text-gray-500">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};