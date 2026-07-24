import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">DentalSaaS</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
            <Link href="/faq" className="transition-colors hover:text-foreground/80 text-foreground/60">FAQ</Link>
            <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">Blog</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Get Started</Button>
            </Link>
            <Link href="/book-demo">
              <Button>Book Demo</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
