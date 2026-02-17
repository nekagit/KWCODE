import { Sidebar } from "@/components/organisms/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background p-6">
        {children}
      </main>
    </div>
  );
}
