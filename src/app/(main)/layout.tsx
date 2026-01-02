import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop only */}
      <Suspense fallback={null}>
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </Suspense>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <Header />

        {/* Desktop Header */}
        <DesktopHeader />

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
