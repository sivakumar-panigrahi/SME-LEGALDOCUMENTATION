
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Bell, Sparkles } from "lucide-react";

export const NotificationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    documentCreated: true,
    sentForReview: true,
    approvalReceived: true,
    documentSigned: true,
    emailDigest: false
  });
  const { toast } = useToast();

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const notificationOptions = [
    {
      key: 'documentCreated',
      title: 'Document Created',
      description: 'Get notified when new documents are created',
      value: notifications.documentCreated
    },
    {
      key: 'sentForReview',
      title: 'Sent for Review',
      description: 'Get notified when documents are sent for review',
      value: notifications.sentForReview
    },
    {
      key: 'approvalReceived',
      title: 'Approval Received',
      description: 'Get notified when documents are approved',
      value: notifications.approvalReceived
    },
    {
      key: 'documentSigned',
      title: 'Document Signed',
      description: 'We\'ll notify you when documents are signed',
      value: notifications.documentSigned
    },
    {
      key: 'emailDigest',
      title: 'Weekly Email Digest',
      description: 'Receive a weekly summary of your activity',
      value: notifications.emailDigest
    }
  ];

  return (
    <Card className="modern-card border-0 shadow-xl hover-scale hover:shadow-2xl transition-shadow">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Notification Preferences
              <Sparkles className="h-5 w-5 text-blue-600" />
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              We'll notify you when important events happen. You can change these settings any time.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          {notificationOptions.map((option, index) => (
            <div 
              key={option.key}
              className={`flex items-start justify-between p-4 rounded-xl hover:bg-white/50 transition-all duration-300 micro-interaction ${
                index < notificationOptions.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex-1 pr-4">
                <h4 className="font-semibold text-gray-900 text-sm md:text-base">{option.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </div>
              <Switch
                checked={option.value}
                onCheckedChange={(checked) => handleNotificationChange(option.key, checked)}
                className="mt-1 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
              />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSavePreferences}
            disabled={isLoading}
            className="btn-gradient-primary w-full md:w-auto h-12 px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
