'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserButton } from '@/components/features/auth/user-button';

export function DesktopHeader() {
  return (
    <header className="sticky top-0 z-40 hidden h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:flex lg:items-center lg:justify-end lg:px-6">
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
}
