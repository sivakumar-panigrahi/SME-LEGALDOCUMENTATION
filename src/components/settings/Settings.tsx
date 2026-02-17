
import { useState } from "react";
import { 
  User, 
  Bell, 
  Users, 
  Shield,
  Sparkles
} from "lucide-react";
import { ProfileSettings } from "./ProfileSettings";
import { NotificationSettings } from "./NotificationSettings";
import { TeamSettings } from "./TeamSettings";
import { SecuritySettings } from "./SecuritySettings";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "team", name: "Team Access", icon: Users },
    { id: "security", name: "Security", icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "team":
        return <TeamSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold heading-gradient mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Manage your account, team, and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="modern-card p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 micro-interaction min-h-[48px] ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-white/70 text-gray-700 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Navigation */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="modern-card p-6 sticky top-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-300 micro-interaction min-h-[56px] ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-700 hover:bg-white/70 hover:text-gray-900 hover:shadow-md"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="animate-scale-in">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
