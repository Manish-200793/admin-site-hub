import { Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  requireRole?: AppRole;
  redirectTo?: string;
}

export const ProtectedRoute = ({ children, requireRole, redirectTo = "/auth" }: Props) => {
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} state={{ from: location }} replace />;

  if (requireRole && !roles.includes(requireRole)) {
    // Wrong role — kick them back home
    return <Navigate to={requireRole === "admin" ? "/admin/login" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};
