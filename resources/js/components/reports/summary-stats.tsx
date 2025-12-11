import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SummaryStatsProps {
    readonly summary: Record<string, unknown>;
}

export function SummaryStats({ summary }: SummaryStatsProps) {
    // Filter out nested objects/arrays for simple display
    const simpleStats = Object.entries(summary).filter(
        ([, value]) => typeof value !== 'object' || value === null
    );

    if (simpleStats.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <CardTitle>Summary</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {simpleStats.map(([key, value]) => (
                        <div key={key} className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {formatLabel(key)}
                            </p>
                            <p className="text-2xl font-bold">
                                {formatValue(value)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function formatLabel(key: string): string {
    return key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    }
    return 'N/A';
}
