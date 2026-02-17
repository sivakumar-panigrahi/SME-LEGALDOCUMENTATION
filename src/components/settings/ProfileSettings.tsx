import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const ProfileSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    company: "",
    bio: "",
    signature: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile || user) {
      const name = profile?.full_name || user?.user_metadata?.full_name || "";
      setProfileData({
        fullName: name,
        email: profile?.email || user?.email || "",
        company: "",
        bio: "",
        signature: `${name}\n${profile?.email || user?.email || ""}`
      });
    }
  }, [profile, user]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: profileData.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update profile: " + error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="hover-scale hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
            <Input 
              id="fullName" 
              value={profileData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="h-11" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={profileData.email}
              disabled
              className="h-11 bg-muted" 
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
          
          <Button 
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="w-full md:w-auto h-11 px-6"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Save Changes</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="hover-scale hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Company Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-sm font-medium">Default Signature Block</Label>
            <Textarea 
              id="signature" 
              placeholder="This will appear in your documents..."
              rows={4}
              value={profileData.signature}
              onChange={(e) => handleInputChange('signature', e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
