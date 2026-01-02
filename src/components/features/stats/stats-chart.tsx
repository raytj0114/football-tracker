'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsChartProps {
  data: {
    name: string;
    wins: number;
    draws: number;
    losses: number;
  }[];
  title?: string;
}

export function StatsChart({ data, title = '成績推移' }: StatsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '1rem' }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    wins: '勝利',
                    draws: '引分',
                    losses: '敗北',
                  };
                  return labels[value] ?? value;
                }}
              />
              <Bar dataKey="wins" fill="hsl(var(--win))" radius={[4, 4, 0, 0]} name="wins" />
              <Bar dataKey="draws" fill="hsl(var(--draw))" radius={[4, 4, 0, 0]} name="draws" />
              <Bar dataKey="losses" fill="hsl(var(--loss))" radius={[4, 4, 0, 0]} name="losses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
