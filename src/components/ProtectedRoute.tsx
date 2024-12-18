import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isGuest } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!user && !isGuest) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


