import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Receipt,
  Shield,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/policy/POL-001", label: "Policy", icon: FileText },
  { to: "/policy/POL-001/payroll", label: "Payroll", icon: DollarSign },
  { to: "/policy/POL-001/billing", label: "Billing", icon: Receipt },
  { to: "/policy/POL-001/claims", label: "Claims", icon: Shield },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-2">
          <h1 className="text-lg font-bold">Policyholder Portal</h1>
          <p className="text-xs text-muted-foreground">
            Workers' Comp Insurance
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild>
                  <Link to={item.to}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
