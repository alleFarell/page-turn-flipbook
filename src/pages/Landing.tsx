import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { FileUp, BookOpen, Link as LinkIcon, Code } from 'lucide-react';

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <a href="#landing-content" className="skip-to-content">Skip to content</a>
      <Navbar />
      
      {/* Hero Section */}
      <section id="landing-content" className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 transform-gpu blur-3xl" aria-hidden="true">
          <div className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-10" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mx-auto max-w-4xl font-heading text-5xl font-medium tracking-tight text-foreground sm:text-7xl animate-fade-in-up">
            Bring Your Documents to Life. <br className="hidden sm:block" />
            <span className="text-primary italic">No Coding Required.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground animate-fade-in-up delay-100">
            Transform flat PDFs into stunning, interactive flipbooks in seconds. Share anywhere, embed easily, and captivate your audience with a realistic reading experience.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up delay-200">
            <Button size="lg" className="h-12 px-8 text-base" asChild id="landing-cta">
              <Link to={user ? '/dashboard' : '/auth'}>
                {user ? 'Go to My Library' : 'Create Your First Flipbook'}
              </Link>
            </Button>
            {!user && (
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/auth">View Example</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/50 bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
              Everything you need to publish like a pro
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Say goodbye to boring, static PDFs. We provide the tools to make your content engaging and highly accessible.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              
              <div className="flex flex-col bg-card p-8 rounded-2xl border editorial-shadow transition-all hover:-translate-y-1 hover:border-primary/50">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Instant Uploads</h3>
                <p className="text-muted-foreground flex-auto">
                  Drag and drop your PDF file. We handle the conversion automatically with support for files up to 20MB.
                </p>
              </div>

              <div className="flex flex-col bg-card p-8 rounded-2xl border editorial-shadow transition-all hover:-translate-y-1 hover:border-primary/50">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Realistic Feel</h3>
                <p className="text-muted-foreground flex-auto">
                  Beautiful, physics-based page turning animation that mimics a real book. Flawless on both desktop and mobile.
                </p>
              </div>

              <div className="flex flex-col bg-card p-8 rounded-2xl border editorial-shadow transition-all hover:-translate-y-1 hover:border-primary/50">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <LinkIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Share Anywhere</h3>
                <p className="text-muted-foreground flex-auto">
                  Generate a unique link to share with anyone. Keep it public for SEO or restrict access with private tokens.
                </p>
              </div>

              <div className="flex flex-col bg-card p-8 rounded-2xl border editorial-shadow transition-all hover:-translate-y-1 hover:border-primary/50">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Embed Easily</h3>
                <p className="text-muted-foreground flex-auto">
                  Drop our lightweight iframe onto your website, blog, or Notion page. Fully responsive out of the box.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} FlipBook. Crafted with precision.
        </p>
      </footer>
    </div>
  );
}
