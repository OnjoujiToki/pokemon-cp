'use client';

import { useState } from 'react';
import { loginUser, signInWithGoogle } from '@/lib/firebase/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { user, error: loginError } = await loginUser(email, password);
    
    if (loginError) {
      // Improve error messages for common Firebase auth errors
      let errorMessage = loginError;
      if (loginError.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email';
      } else if (loginError.includes('auth/wrong-password')) {
        errorMessage = 'Incorrect password';
      } else if (loginError.includes('auth/too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      setError(errorMessage);
      setLoading(false);
      return;
    }

    if (user) {
      // Get the ID token
      const idToken = await user.getIdToken();
      
      // Set session cookie
      document.cookie = `session=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
      
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    const { user, error: signInError } = await signInWithGoogle();
    
    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    if (user) {
      const idToken = await user.getIdToken();
      document.cookie = `session=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">
              Sign in
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email and password to sign in
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="mr-2 h-4 w-4"
            />
            Sign in with Google
          </Button>
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link 
              href="/register" 
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}