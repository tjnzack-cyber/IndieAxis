import BottomNav from '@/components/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0b1a] flex flex-col pb-20 md:pb-0">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
