'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FavoriteTeam {
  id: string;
  teamId: number;
  teamName: string;
  teamCrest: string | null;
}

interface FavoriteTeamListProps {
  teams: FavoriteTeam[];
}

type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export function FavoriteTeamList({ teams }: FavoriteTeamListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredAndSortedTeams = useMemo(() => {
    let result = [...teams];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((team) => team.teamName.toLowerCase().includes(query));
    }

    // Apply sort
    result.sort((a, b) => {
      const nameA = a.teamName.toLowerCase();
      const nameB = b.teamName.toLowerCase();
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      }
      return nameB.localeCompare(nameA);
    });

    return result;
  }, [teams, searchQuery, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="チーム名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Sort Order */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          <span className="hidden sm:inline">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
        </Button>

        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-input">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-r-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Info */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedTeams.length}件のチームが見つかりました
          {filteredAndSortedTeams.length !== teams.length && `（全${teams.length}件中）`}
        </p>
      )}

      {/* Team List */}
      {filteredAndSortedTeams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">
            該当するチームが見つかりません
          </p>
          <p className="mt-1 text-sm text-muted-foreground">検索キーワードを変更してください</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.teamId}`}>
              <Card className="card-hover flex items-center gap-4 p-4">
                {team.teamCrest ? (
                  <Image
                    src={team.teamCrest}
                    alt={team.teamName}
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                    <span className="text-lg font-bold text-muted-foreground">
                      {team.teamName.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="font-medium">{team.teamName}</span>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedTeams.map((team) => (
            <Link key={team.id} href={`/teams/${team.teamId}`}>
              <Card className="card-hover flex items-center gap-4 p-3">
                {team.teamCrest ? (
                  <Image
                    src={team.teamCrest}
                    alt={team.teamName}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted flex-shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">
                      {team.teamName.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="font-medium">{team.teamName}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
