import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/" className="text-xl">Party Image</Link>
            </div>
            <div className="flex gap-2 items-center">
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
              {user && (
                <Link href="/protected/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center gap-8">
            <h1 className="text-5xl font-bold tracking-tight">
              Turn Your Party Into an Interactive Art Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Let your guests create AI-generated images in real-time. Watch as their imagination comes to life on your party screen!
            </p>
            {!user && (
              <Link href="/auth/sign-up">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">AI Image Generation</h3>
              <p className="text-muted-foreground">
                Generate stunning images from text prompts using advanced AI models
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
              <p className="text-muted-foreground">
                Share a simple QR code or link for guests to submit their prompts
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Watch as new images appear instantly on your party screen
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="flex flex-col items-center text-center gap-8">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="text-2xl font-bold text-primary">1</div>
                <h3 className="text-xl font-semibold">Create a Session</h3>
                <p className="text-muted-foreground">
                  Set up a new party session and get your unique sharing link
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-2xl font-bold text-primary">2</div>
                <h3 className="text-xl font-semibold">Share with Guests</h3>
                <p className="text-muted-foreground">
                  Share the QR code or link with your party guests
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-2xl font-bold text-primary">3</div>
                <h3 className="text-xl font-semibold">Watch the Magic</h3>
                <p className="text-muted-foreground">
                  See your guests' prompts transform into beautiful images
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
