'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Trophy,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVAILABLE_LEAGUES } from '@/lib/football-api/constants';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLeague = searchParams.get('league');
  const [collapsed, setCollapsed] = useState(false);
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null);

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
            <span className="font-bold">
              Football Tracker <span className="text-xs text-muted-foreground">β</span>
            </span>
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
              {AVAILABLE_LEAGUES.map((league) => {
                const isActive = currentLeague === league.code;
                const isExpanded = expandedLeague === league.code;

                return (
                  <div key={league.code}>
                    <button
                      onClick={() => setExpandedLeague(isExpanded ? null : league.code)}
                      className={cn('sidebar-item w-full', isActive && 'sidebar-item-active')}
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
                      <span className="flex-1 truncate text-left">{league.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-8 space-y-1 py-1">
                        <Link
                          href={`/matches?league=${league.code}`}
                          className={cn(
                            'sidebar-item text-sm',
                            pathname === '/matches' && isActive && 'sidebar-item-active'
                          )}
                        >
                          <Calendar className="h-4 w-4" />
                          <span>試合</span>
                        </Link>
                        <Link
                          href={`/standings?league=${league.code}`}
                          className={cn(
                            'sidebar-item text-sm',
                            pathname === '/standings' && isActive && 'sidebar-item-active'
                          )}
                        >
                          <Trophy className="h-4 w-4" />
                          <span>順位表</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mt-6 space-y-1">
            {AVAILABLE_LEAGUES.map((league) => {
              const isActive = currentLeague === league.code;
              const collapsedLinkPath = pathname.startsWith('/standings')
                ? '/standings'
                : '/matches';

              return (
                <Link
                  key={league.code}
                  href={`${collapsedLinkPath}?league=${league.code}`}
                  className={cn(
                    'sidebar-item justify-center px-2',
                    isActive && 'sidebar-item-active'
                  )}
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
              );
            })}
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
