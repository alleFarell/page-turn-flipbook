import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BookOpen, AlertCircle } from 'lucide-react';

export function Auth() {
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Left pane - Image/Brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603503364272-6e21e067e273?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
        
        <Link to="/" className="relative z-10 flex items-center gap-2 text-white">
          <BookOpen className="h-8 w-8" />
          <span className="font-heading text-2xl font-bold tracking-tight">FlipBook.</span>
        </Link>

        <div className="relative z-10 max-w-lg mt-auto">
          <blockquote className="space-y-4">
            <p className="font-heading text-3xl font-medium leading-tight">
              "The most elegant way to share our quarterly reports. Our clients love the immersive reading experience."
            </p>
            <footer className="text-sm text-zinc-400">
              — Sarah Jenkins, Creative Director
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right pane - Form */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2 sm:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="flex flex-col space-y-2 text-center lg:hidden">
            <Link to="/" className="mx-auto flex items-center gap-2 text-primary">
              <BookOpen className="h-8 w-8" />
            </Link>
          </div>

          <Card className="border-0 shadow-none sm:border sm:shadow-sm bg-transparent sm:bg-card">
            <CardHeader className="space-y-1">
              <CardTitle className="font-heading text-2xl">Welcome to FlipBook</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {error && (
                  <div className="mb-6 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {tab === 'signin' && (
                        <Link to="#" className="text-xs text-primary hover:underline" tabIndex={-1}>
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      minLength={6}
                      autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    />
                  </div>
                  <Button type="submit" className="w-full mt-6" disabled={loading} id="btn-auth-submit">
                    {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Start My Free Trial'}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link to="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
