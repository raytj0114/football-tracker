'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Trophy, Heart, ChevronLeft, ChevronRight, Home, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVAILABLE_LEAGUES } from '@/lib/football-api/constants';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/matches', label: '試合', icon: Calendar },
    { href: '/standings', label: '順位表', icon: Trophy },
    { href: '/favorites', label: 'お気に入り', icon: Heart },
  ];

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Star className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">Football Tracker</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Star className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'sidebar-item',
                  isActive && 'sidebar-item-active',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Leagues */}
        {!collapsed && (
          <div className="mt-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              リーグ
            </p>
            <div className="space-y-1">
              {AVAILABLE_LEAGUES.map((league) => (
                <Link
                  key={league.code}
                  href={`/matches?league=${league.code}`}
                  className="sidebar-item"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-white p-0.5">
                    <Image
                      src={league.emblem}
                      alt={league.name}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                  <span className="truncate">{league.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mt-6 space-y-1">
            {AVAILABLE_LEAGUES.map((league) => (
              <Link
                key={league.code}
                href={`/matches?league=${league.code}`}
                className="sidebar-item justify-center px-2"
                title={league.name}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-white p-0.5">
                  <Image
                    src={league.emblem}
                    alt={league.name}
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full', collapsed && 'px-2')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">折りたたむ</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
