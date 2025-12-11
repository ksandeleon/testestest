import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ReportFilter } from '@/types/report';
import { Filter, X } from 'lucide-react';

interface FilterPanelProps {
    readonly filters: Record<string, ReportFilter>;
    readonly values: Record<string, unknown>;
    readonly onChange: (key: string, value: unknown) => void;
    readonly onApply: () => void;
    readonly onReset: () => void;
}

export function FilterPanel({ filters, values, onChange, onApply, onReset }: FilterPanelProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        <CardTitle>Filters</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        <X className="h-4 w-4 mr-1" />
                        Reset
                    </Button>
                </div>
                <CardDescription>
                    Customize the report parameters
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.entries(filters).map(([key, filter]) => (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{filter.label}</Label>
                        {filter.type === 'date' && (
                            <Input
                                id={key}
                                type="date"
                                value={String(values[key] || filter.default || '')}
                                onChange={(e) => onChange(key, e.target.value)}
                            />
                        )}
                        {filter.type === 'select' && filter.options && (
                            <Select
                                value={String(values[key] || '')}
                                onValueChange={(value) => onChange(key, value)}
                            >
                                <SelectTrigger id={key}>
                                    <SelectValue placeholder={`Select ${filter.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    {Object.entries(filter.options).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {filter.type === 'text' && (
                            <Input
                                id={key}
                                type="text"
                                value={String(values[key] || '')}
                                onChange={(e) => onChange(key, e.target.value)}
                                placeholder={filter.label}
                            />
                        )}
                    </div>
                ))}
                <Button onClick={onApply} className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                </Button>
            </CardContent>
        </Card>
    );
}
