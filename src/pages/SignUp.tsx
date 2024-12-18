import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, User, Mail, Lock, Leaf, Sparkles, Building2, Users, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    country: ''
  });
  const { toast } = useToast();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (!formData.userType) {
      toast({ title: "Error", description: "Please select your user type", variant: "destructive" });
      return;
    }
    if (!formData.country) {
      toast({ title: "Error", description: "Please select your country", variant: "destructive" });
      return;
    }
    await signUp(formData.name, formData.email, formData.password, formData.userType, formData.country);
    toast({ title: "Success!", description: "Account created. Welcome to FarmPlanet!" });
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const handleGoogleSignUp = async () => {
    // For Google sign up, we'll use default values and let user update profile later
    setFormData({
      ...formData,
      userType: 'individual',
      country: 'us'
    });
    await signUp('Google User', 'google@example.com', 'password', formData.userType, formData.country);
    toast({ title: "Success!", description: "Account created with Google. Please update your profile!" });
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-space bg-stars flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

      <Card className="glass-card w-full max-w-lg relative z-10 border-primary/20">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Leaf className="h-12 w-12 text-primary glow-icon" />
              <Sparkles className="h-6 w-6 text-accent absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold gradient-text">
              Join FarmPlanet
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Create an account to access vegetation data
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/90">
                <User className="w-4 h-4 inline mr-2" />
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="glass-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType" className="text-foreground/90">
                <Users className="w-4 h-4 inline mr-2" />
                I am a
              </Label>
              <Select value={formData.userType} onValueChange={(value) => setFormData({ ...formData, userType: value })}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-green-600" />
                      Farmer
                    </div>
                  </SelectItem>
                  <SelectItem value="company">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                      Agricultural Company
                    </div>
                  </SelectItem>
                  <SelectItem value="individual">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-600" />
                      Individual User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-foreground/90">
                <Globe className="w-4 h-4 inline mr-2" />
                Country
              </Label>
              <Input
                id="country"
                type="text"
                placeholder="Enter your country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="glass-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass-input pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground/90">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="glass-input pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full cosmic-button text-lg font-semibold py-3"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              to="/sign-in"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                className="glass-button w-full max-w-xs"
                onClick={handleGoogleSignUp}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;