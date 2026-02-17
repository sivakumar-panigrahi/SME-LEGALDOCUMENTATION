
import { Home, FileText, FolderOpen, CheckCircle, BookOpen, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface AuthenticatedSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "documents", label: "My Documents", icon: FolderOpen },
  { id: "approvals", label: "Approvals", icon: CheckCircle },
  { id: "clauses", label: "Clause Library", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

export const AuthenticatedSidebar = ({ activeView, onViewChange }: AuthenticatedSidebarProps) => {
  const { user, signOut } = useAuth();
  
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <div className="w-64 bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-lg border-r border-white/20 flex flex-col shadow-xl">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-xl font-bold heading-gradient">LegalFlow</h1>
        <p className="text-sm text-gray-600 mt-1">Document Automation</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 micro-interaction",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-600 hover:bg-white/70 hover:text-gray-900 hover:shadow-md"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/20 space-y-2">
        <div className="flex items-center p-3 rounded-xl bg-white/50 backdrop-blur-sm">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">
              {getInitials(user?.user_metadata?.full_name)}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 micro-interaction"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
