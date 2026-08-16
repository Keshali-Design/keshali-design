import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin — Keshali Design" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated: render children as-is (login page).
  // Middleware handles the redirect for all other /admin routes.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-section flex">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto bg-section">{children}</main>
    </div>
  );
}
