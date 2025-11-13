import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('bank_admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setAdminData(data);
      setIsDemo(data.is_demo || false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/bank-admin/login");
  };

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/bank-admin/dashboard" },
    { title: "Users", icon: Users, path: "/bank-admin/users" },
    { title: "Accounts", icon: Building, path: "/bank-admin/accounts" },
    { title: "Applications", icon: FileText, path: "/bank-admin/applications" },
    { title: "Analytics", icon: BarChart3, path: "/bank-admin/analytics" },
    { title: "Settings", icon: Settings, path: "/bank-admin/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-white transition-all duration-300 fixed top-0 left-0 h-full z-50 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              <span className="font-bold">Admin Portal</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive(item.path) 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              } ${!sidebarOpen && "justify-center"}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className={`h-4 w-4 ${sidebarOpen && "mr-2"}`} />
              {sidebarOpen && item.title}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-16"}`}>
        {/* Top Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {navItems.find(item => isActive(item.path))?.title || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {adminData && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{adminData.full_name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {adminData.role}
                    </Badge>
                    {isDemo && (
                      <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                        DEMO
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Demo Banner */}
        {isDemo && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3">
            <p className="text-sm text-green-800 text-center font-medium">
              🎭 DEMO MODE - This is a demonstration session with full access to all features
            </p>
          </div>
        )}

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
