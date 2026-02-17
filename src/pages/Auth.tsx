import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, LogIn, UserPlus, Sparkles } from "lucide-react";
import { IS_TESTING, ALLOWED_EMAIL } from "@/config/env";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: ""
  });
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          console.error('Login error:', error);
          toast({
            title: "Login Failed",
            description: error.message || "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in."
          });
          navigate("/");
        }
      } else {
        // Sign up flow
        if (!formData.fullName.trim()) {
          toast({
            title: "Full Name Required",
            description: "Please enter your full name to sign up.",
            variant: "destructive"
          });
          return;
        }

        console.log('Attempting signup with:', formData.email, formData.fullName);
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          console.error('Signup error:', error);
          
          if (error.message?.toLowerCase().includes('already registered') || 
              error.message?.toLowerCase().includes('already exists')) {
            toast({
              title: "Account Already Exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive"
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message || "An error occurred during sign up. Please try again.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Account Created Successfully!",
            description: "You can now sign in with your credentials.",
            duration: 4000
          });
          // Switch to login mode and populate email
          setIsLogin(true);
          setFormData(prev => ({ ...prev, password: "", fullName: "" }));
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="modern-card hover-scale hover:shadow-2xl transition-shadow">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold heading-gradient">LegalFlow</h1>
            </div>
            <CardTitle className="text-xl">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {isLogin 
                ? "Sign in to your account" 
                : "Create your LegalFlow account"
              }
            </p>
          </CardHeader>
          
          <CardContent>
            {IS_TESTING && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Testing Mode:</strong> Only verified email ({ALLOWED_EMAIL}) can be used.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="h-11"
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="h-11"
                  required
                  minLength={6}
                />
                {!isLogin && (
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 btn-gradient-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? (
                      <LogIn className="h-4 w-4 mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {isLogin ? "Sign In" : "Create Account"}
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: "", password: "", fullName: "" });
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};