import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md" id="main-navbar">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-heading text-xl font-semibold tracking-tight">FlipBook.</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} id="btn-signout">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button size="sm" asChild id="btn-get-started">
                <Link to="/auth">Start Free Trial</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
