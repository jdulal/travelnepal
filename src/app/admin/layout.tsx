import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <AdminShell user={session ? { name: session.name, email: session.email } : null}>{children}</AdminShell>
  );
}
