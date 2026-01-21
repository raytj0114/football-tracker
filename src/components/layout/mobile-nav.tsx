'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { X, Calendar, Trophy, Heart, Home, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVAILABLE_LEAGUES } from '@/lib/football-api/constants';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLeague = searchParams.get('league');
  const [isClosing, setIsClosing] = useState(false);
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null);

  const navItems = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/matches', label: '試合', icon: Calendar },
    { href: '/standings', label: '順位表', icon: Trophy },
    { href: '/favorites', label: 'お気に入り', icon: Heart },
  ];

  const handleClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  // Handle animation end
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setIsClosing(false);
        onOpenChange(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isClosing, onOpenChange]);

  // Reset isClosing when opening
  useEffect(() => {
    if (open) {
      setIsClosing(false);
    }
  }, [open]);

  if (!open && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-background/80 backdrop-blur-sm',
          isClosing ? 'animate-fade-out' : 'animate-fade-in'
        )}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <nav
        className={cn(
          'fixed inset-y-0 left-0 w-72 border-r border-border bg-card p-6 shadow-lg',
          isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-bold">メニュー</span>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('sidebar-item', isActive && 'sidebar-item-active')}
                onClick={handleClose}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Leagues */}
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
                        onClick={handleClose}
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
                        onClick={handleClose}
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
      </nav>
    </div>
  );
}
