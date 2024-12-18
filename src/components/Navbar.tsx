import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Leaf } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Leaf className="h-8 w-8 text-primary glow-icon" />
            </div>
            <span className="text-xl font-bold gradient-text">FarmPlanet</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" className="glass-button" onClick={() => window.location.href = '/dashboard'}>
                  Dashboard
                </Button>
                <Button
                  className="glow-button"
                  onClick={async () => {
                    await signOut();
                    window.location.href = '/';
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="glass-button" onClick={() => window.location.href = '/sign-in'}>
                  Sign In
                </Button>
                <Button className="glow-button" onClick={() => window.location.href = '/sign-up'}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border">
          <div className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-foreground/80 hover:text-primary transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="flex flex-col space-y-2 pt-4">
              {user ? (
                <>
                  <Button variant="outline" className="glass-button" onClick={() => { setIsMenuOpen(false); window.location.href = '/dashboard'; }}>
                    Dashboard
                  </Button>
                  <Button className="glow-button" onClick={async () => { await signOut(); setIsMenuOpen(false); window.location.href = '/'; }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="glass-button" onClick={() => { setIsMenuOpen(false); window.location.href = '/sign-in'; }}>
                    Sign In
                  </Button>
                  <Button className="glow-button" onClick={() => { setIsMenuOpen(false); window.location.href = '/sign-up'; }}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;