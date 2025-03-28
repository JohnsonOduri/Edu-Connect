
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">EduConnect</span>
          </Link>
          
          <nav className="hidden gap-6 md:flex">
            <Link to="/" className="flex items-center text-lg font-medium transition-colors hover:text-foreground/80 text-foreground/60">
              Home
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="flex items-center text-lg font-medium transition-colors hover:text-foreground/80 text-foreground/60">
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm hidden md:inline-block">
                  {user?.name}
                </span>
                <Button 
                  onClick={() => logout()} 
                  variant="outline"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
