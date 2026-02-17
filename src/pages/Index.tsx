
import { useAuth } from "@/hooks/useAuth";
import { AuthenticatedIndex } from "@/pages/AuthenticatedIndex";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { UserPlus, LogIn, FileText, CheckCircle, Users, Shield } from "lucide-react";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If user is authenticated, show the main app
  if (user) {
    return <AuthenticatedIndex />;
  }

  // If user is not authenticated, show landing page with auth options
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">LegalFlow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className="flex items-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Legal Document Workflow
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create, manage, and process legal documents with ease. From templates to signatures, 
            LegalFlow handles your entire document lifecycle.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="px-8 py-3 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover-scale hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create, organize, and manage all your legal documents in one secure platform.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Digital Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Collect legally binding signatures electronically with our secure signature system.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Work together with your team on documents with approval workflows and real-time updates.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8 hover-scale hover:shadow-xl transition-shadow cursor-pointer">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of legal professionals who trust LegalFlow for their document needs.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
          >
            Create Your Account
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 LegalFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
