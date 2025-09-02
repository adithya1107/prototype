import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

const MultiStepLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          await handleAuthenticatedUser(session.user);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthenticatedUser = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching user profile:', error);
        toast({
          title: 'Profile Error',
          description: 'Could not load user profile. Please contact support.',
          variant: 'destructive',
        });
        return;
      }

      const userData = {
        user_id: profile.id,
        user_type: profile.user_type,
        first_name: profile.first_name,
        last_name: profile.last_name,
        college_id: profile.college_id,
        user_code: profile.user_code,
        email: profile.email
      };

      localStorage.setItem('colcord_user', JSON.stringify(userData));

      const userRoutes = {
        'student': '/student',
        'faculty': '/teacher',
        'teacher': '/teacher',
        'admin': '/admin',
        'super_admin': '/admin',
        'parent': '/parent',
        'alumni': '/alumni'
      };

      const route = userRoutes[profile.user_type as keyof typeof userRoutes] || '/student';
      navigate(route);
    } catch (error) {
      console.error('Error handling authenticated user:', error);
    }
  };

  const handleDirectLogin = async (userType: string) => {
    setIsLoading(true);

    const credentials = {
      student: { email: 'student@demo.com', password: '123456' },
      faculty: { email: 'faculty@demo.com', password: '123456' },
      admin: { email: 'admin@demo.com', password: '123456' },
      alumni: { email: 'alumni@demo.com', password: '123456' },
      parent: { email: 'parent@demo.com', password: '123456' }
    };

    try {
      const { email, password } = credentials[userType as keyof typeof credentials];
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: 'Login Failed',
          description: error.message || 'An error occurred during login.',
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        toast({
          title: 'Login Successful',
          description: `Welcome ${userType}! Redirecting to your dashboard...`,
        });
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      <div className="relative z-10 w-full max-w-md min-w-[400px]">
        {/* Hero Section */}
        <div className="text-center mb-macro-md animate-fade-in-up">
          <h1 className="text-hero text-foreground mb-4">
            TAPMI
          </h1>
          <p className="text-body-large text-muted-foreground">
            Built for India. Global Standards.
          </p>
        </div>

        {/* Card container */}
        <Card className="border-border bg-card backdrop-blur-sm h-[400px] w-full flex flex-col">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="text-section-header text-center text-card-foreground">
              Select Your Role
            </CardTitle>
          </CardHeader>
          
          {/* Content area with login buttons */}
          <CardContent className="flex-grow flex flex-col justify-center px-6">
            <div className="space-y-4 animate-fade-in">
              <Button 
                onClick={() => handleDirectLogin('student')} 
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-300 hover-scale focus-ring"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : 'Login as Student'}
              </Button>

              <Button 
                onClick={() => handleDirectLogin('faculty')} 
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-300 hover-scale focus-ring"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : 'Login as Faculty'}
              </Button>

              <Button 
                onClick={() => handleDirectLogin('admin')} 
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-300 hover-scale focus-ring"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : 'Login as Admin'}
              </Button>

              <Button 
                onClick={() => handleDirectLogin('alumni')} 
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-300 hover-scale focus-ring"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : 'Login as Alumni'}
              </Button>

              <Button 
                onClick={() => handleDirectLogin('parent')} 
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all duration-300 hover-scale focus-ring"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : 'Login as Parent'}
              </Button>
            </div>
          </CardContent>
          
          {/* Footer section */}
          <div className="px-6 pb-6 flex-shrink-0">
            <div className="text-center">
              <a 
                href="https://colcord.co.in/contact" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 underline-offset-4 hover:underline focus-ring rounded-sm"
              >
                Need assistance? Contact support
              </a>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-macro-sm">
          <p className="text-xs text-white-40">
            Powered by ColCord • Secure • Reliable • Indian
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiStepLogin;