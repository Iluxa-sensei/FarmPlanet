import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;
    const target = localStorage.getItem("postAuthRedirect") || "/dashboard";
    localStorage.removeItem("postAuthRedirect");
    if (user) {
      navigate(target, { replace: true });
    } else {
      navigate("/sign-in", { replace: true });
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Completing sign-in...
    </div>
  );
}


