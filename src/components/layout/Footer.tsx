
import React from "react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card py-6 md:py-0">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-6 md:h-16">
        <div className="flex items-center gap-2">
          <img className="w-10" src="../../public/favicon.ico" alt="" />
          <span className="text-sm font-medium">EduConnect</span>
        </div>
        
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </nav>
        
        <div className="text-xs text-muted-foreground ">
          &copy; {currentYear} EduConnect
        </div>
      </div>
    </footer>
  );
}
