
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { validateTestingEmail, getTestingMessage } from '@/config/env';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Check for error parameters in URL on mount
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      console.log('URL contains auth error:', { error, errorDescription });
      
      // Clean up the URL
      if (window.history.replaceState) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      // Handle specific errors
      if (error === 'access_denied' && errorDescription?.includes('expired')) {
        console.log('Email confirmation link expired');
        // We'll handle this in the UI by showing appropriate messaging
      }
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event !== 'SIGNED_OUT') {
          console.log('User authenticated, fetching profile...');
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { session: !!session, error });
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        // Don't set loading to false here, let the auth state change handler do it
        if (session) {
          setSession(session);
          setUser(session.user);
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile fetched:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Starting sign up process for:', email);
      
      // Check if email is allowed in testing environment
      if (!validateTestingEmail(email)) {
        console.log('Email not allowed in testing environment:', email);
        return { 
          error: { 
            message: getTestingMessage(),
            status: 400 
          }
        };
      }
      
      // Use the current origin for redirect - ensure it's the app URL, not Supabase
      const appUrl = window.location.origin;
      const redirectUrl = `${appUrl}/`;
      console.log('Sign up redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim()
          }
        }
      });
      
      console.log('Sign up response:', { 
        data: data ? { user: !!data.user, session: !!data.session } : null, 
        error: error ? { message: error.message, status: error.status } : null
      });
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      
      console.log('Sign in response:', { 
        data: data ? { user: !!data.user, session: !!data.session } : null, 
        error: error ? { message: error.message, status: error.status } : null 
      });
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      console.log('Resending confirmation email for:', email);
      
      // Check if email is allowed in testing environment
      if (!validateTestingEmail(email)) {
        console.log('Email not allowed in testing environment:', email);
        return { 
          error: { 
            message: getTestingMessage(),
            status: 400 
          }
        };
      }
      
      const appUrl = window.location.origin;
      const redirectUrl = `${appUrl}/`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      console.log('Resend confirmation response:', { 
        error: error ? { message: error.message, status: error.status } : null 
      });
      
      return { error };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
