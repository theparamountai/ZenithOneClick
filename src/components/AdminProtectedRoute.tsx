import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is in bank_admins table
      const { data, error } = await supabase
        .from('bank_admins')
        .select('id, is_active')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();

      setIsAdmin(!!data && !error);
      setLoading(false);
    };

    checkAdminAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/bank-admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
