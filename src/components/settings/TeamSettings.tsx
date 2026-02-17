
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Trash2,
  Edit,
  Mail,
  MoreVertical,
  UserCheck,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const initialTeamMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@company.com",
    role: "Admin",
    status: "Active",
    joinedDate: "Jan 15, 2024"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@company.com", 
    role: "Editor",
    status: "Active",
    joinedDate: "Feb 20, 2024"
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike@company.com",
    role: "Reviewer",
    status: "Pending",
    joinedDate: "Mar 1, 2024"
  }
];

export const TeamSettings = () => {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "Editor"
  });
  const { toast } = useToast();

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800";
      case "Editor":
        return "bg-blue-100 text-blue-800";
      case "Reviewer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleInviteMember = () => {
    if (!inviteData.email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive"
      });
      return;
    }

    const newMember = {
      id: Date.now(),
      name: inviteData.email.split('@')[0],
      email: inviteData.email,
      role: inviteData.role,
      status: "Pending",
      joinedDate: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    };

    setTeamMembers([...teamMembers, newMember]);
    setIsInviteModalOpen(false);
    setInviteData({ email: "", role: "Editor" });
    
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteData.email} as ${inviteData.role}`,
    });
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = () => {
    if (!selectedMember) return;

    setTeamMembers(teamMembers.map(member => 
      member.id === selectedMember.id ? selectedMember : member
    ));
    setIsEditModalOpen(false);
    setSelectedMember(null);
    
    toast({
      title: "Member Updated",
      description: "Team member has been updated successfully.",
    });
  };

  const handleDeleteMember = (memberId: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== memberId));
    toast({
      title: "Member Removed",
      description: "Team member has been removed successfully.",
    });
  };

  const handleToggleStatus = (memberId: number) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, status: member.status === 'Active' ? 'Pending' : 'Active' }
        : member
    ));
    
    toast({
      title: "Status Updated",
      description: "Member status has been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="hover-scale hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Team Members</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage who has access to your documents</p>
            </div>
            <Button 
              onClick={() => setIsInviteModalOpen(true)} 
              className="w-full sm:w-auto h-11"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-medium text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm md:text-base truncate">{member.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    <p className="text-xs text-muted-foreground">Joined {member.joinedDate}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getRoleColor(member.role)} text-xs`}>
                      {member.role}
                    </Badge>
                    <Badge variant="outline" className={`${getStatusColor(member.status)} text-xs`}>
                      {member.status}
                    </Badge>
                  </div>
                  
                  {/* Desktop Actions */}
                  <div className="hidden sm:flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9"
                      onClick={() => handleToggleStatus(member.id)}
                    >
                      {member.status === 'Active' ? 
                        <UserX className="h-4 w-4" /> : 
                        <UserCheck className="h-4 w-4" />
                      }
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive h-9 w-9"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile Actions */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleEditMember(member)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(member.id)}>
                          {member.status === 'Active' ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="w-full max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="colleague@company.com"
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inviteRole">Role</Label>
              <select 
                id="inviteRole"
                value={inviteData.role}
                onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full h-11 p-2 border border-input rounded-md bg-background"
              >
                <option value="Editor">Editor</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsInviteModalOpen(false)}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleInviteMember}
                className="flex-1 h-11"
                disabled={!inviteData.email}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-full max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={selectedMember.name}
                  onChange={(e) => setSelectedMember(prev => ({ ...prev, name: e.target.value }))}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <select 
                  id="editRole"
                  value={selectedMember.role}
                  onChange={(e) => setSelectedMember(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full h-11 p-2 border border-input rounded-md bg-background"
                >
                  <option value="Editor">Editor</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateMember}
                  className="flex-1 h-11"
                >
                  Update Member
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
