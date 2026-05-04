import { DashboardNav } from "@/components/DashboardNav";
import { logout } from "@/app/login/actions";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-fog p-4 text-ink lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]">
        <DashboardNav logoutAction={logout} />
        <section>{children}</section>
      </div>
    </main>
  );
}
