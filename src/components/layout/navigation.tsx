'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserButton } from '@/components/features/auth/user-button';

const navItems = [
  { href: '/matches', label: '試合' },
  { href: '/standings', label: '順位表' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-gray-900',
            pathname.startsWith(item.href) ? 'text-gray-900' : 'text-gray-500'
          )}
        >
          {item.label}
        </Link>
      ))}
      <UserButton />
    </nav>
  );
}
