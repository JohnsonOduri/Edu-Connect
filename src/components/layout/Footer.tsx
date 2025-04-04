import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card py-8">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-row items-center justify-center gap-8">
          <Link to="/" className="text-xl font-bold">
            EduConnect
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
};
