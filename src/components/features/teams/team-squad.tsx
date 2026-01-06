import type { Player } from '@/types/football-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TeamSquadProps {
  squad: Player[];
}

// General position categories for grouping
const positionCategories = ['Goalkeeper', 'Defence', 'Midfield', 'Offence'] as const;
type BasePositionCategory = (typeof positionCategories)[number];
type PositionCategory = BasePositionCategory | 'その他';

const ALL_POSITION_CATEGORIES: readonly PositionCategory[] = [...positionCategories, 'その他'];

function isBasePositionCategory(value: string): value is BasePositionCategory {
  return positionCategories.includes(value as BasePositionCategory);
}

const positionOrder: Record<string, number> = {
  Goalkeeper: 1,
  Defence: 2,
  Midfield: 3,
  Offence: 4,
};

const positionCategoryLabels: Record<string, string> = {
  Goalkeeper: 'ゴールキーパー',
  Defence: 'ディフェンダー',
  Midfield: 'ミッドフィルダー',
  Offence: 'フォワード',
};

const positionColors: Record<string, string> = {
  Goalkeeper: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  Defence: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Midfield: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Offence: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

// Map specific positions to their category
function getPositionCategory(position: string | null): PositionCategory {
  if (!position) return 'その他';

  const posLower = position.toLowerCase();

  // Goalkeeper
  if (posLower.includes('goalkeeper') || posLower === 'gk') {
    return 'Goalkeeper';
  }

  // Defence
  if (
    posLower.includes('back') ||
    posLower.includes('defence') ||
    posLower.includes('defender') ||
    posLower === 'df'
  ) {
    return 'Defence';
  }

  // Midfield
  if (
    posLower.includes('midfield') ||
    posLower.includes('midfielder') ||
    posLower === 'mf' ||
    posLower.includes('wing') // Wingers often play midfield role
  ) {
    return 'Midfield';
  }

  // Offence
  if (
    posLower.includes('forward') ||
    posLower.includes('striker') ||
    posLower.includes('attack') ||
    posLower === 'fw' ||
    posLower === 'cf' ||
    posLower === 'st'
  ) {
    return 'Offence';
  }

  // General categories from API
  if (isBasePositionCategory(position)) {
    return position;
  }

  return 'その他';
}

// Display-friendly position names
const specificPositionLabels: Record<string, string> = {
  Goalkeeper: 'GK',
  'Centre-Back': 'CB',
  'Left-Back': 'LB',
  'Right-Back': 'RB',
  'Defensive Midfield': 'DMF',
  'Central Midfield': 'CMF',
  'Attacking Midfield': 'AMF',
  'Left Midfield': 'LMF',
  'Right Midfield': 'RMF',
  'Left Winger': 'LW',
  'Right Winger': 'RW',
  'Centre-Forward': 'CF',
  Defence: 'DF',
  Midfield: 'MF',
  Offence: 'FW',
};

function getPositionLabel(position: string | null): string {
  if (!position) return '-';
  return specificPositionLabels[position] ?? position;
}

function createEmptyGroupedSquad(): Record<PositionCategory, Player[]> {
  return {
    Goalkeeper: [],
    Defence: [],
    Midfield: [],
    Offence: [],
    その他: [],
  };
}

export function TeamSquad({ squad }: TeamSquadProps) {
  // Group players by position category
  const groupedSquad = squad.reduce<Record<PositionCategory, Player[]>>((acc, player) => {
    const category = getPositionCategory(player.position);
    acc[category].push(player);
    return acc;
  }, createEmptyGroupedSquad());

  // Sort categories by position order, filter out empty categories
  const sortedCategories = ALL_POSITION_CATEGORIES.filter(
    (category) => groupedSquad[category].length > 0
  ).sort((a, b) => {
    const orderA = positionOrder[a] ?? 5;
    const orderB = positionOrder[b] ?? 5;
    return orderA - orderB;
  });

  return (
    <div className="space-y-8">
      {sortedCategories.map((category) => (
        <div key={category}>
          <div className="mb-4 flex items-center gap-3">
            <Badge className={positionColors[category] ?? 'bg-muted'}>
              {positionCategoryLabels[category] ?? category}
            </Badge>
            <span className="text-sm text-muted-foreground">{groupedSquad[category].length}人</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groupedSquad[category].map((player) => (
              <Card key={player.id} className="card-hover">
                <CardContent className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {player.nationality ?? '-'}
                    </p>
                  </div>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted flex-shrink-0">
                    {getPositionLabel(player.position)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
