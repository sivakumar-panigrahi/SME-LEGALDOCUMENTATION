
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Shield, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const SecuritySettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handlePasswordUpdate = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutAllSessions = async () => {
    setIsLoading(true);
    try {
      // Sign out globally (all sessions) then sign back in on this device
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      toast({
        title: "Sessions Terminated",
        description: "All sessions have been signed out. Please sign in again.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to sign out other sessions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <Card className="hover-scale hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              type="password" 
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="h-11" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="h-11" 
            />
          </div>
          
          <Button 
            onClick={handlePasswordUpdate}
            disabled={isLoading}
            className="w-full md:w-auto h-11 px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card className="hover-scale hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign out of all sessions across all devices. You will need to sign in again.
          </p>
          
          <Button 
            variant="outline" 
            onClick={handleSignOutAllSessions}
            disabled={isLoading}
            className="w-full h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing Out...
              </>
            ) : (
              "Sign Out All Sessions"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
