import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Location {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Item {
    id: number;
    iar_number: string;
    property_number: string;
    name: string;
    description: string;
    brand: string | null;
    model: string | null;
    serial_number: string | null;
    acquisition_cost: string;
    category: Category;
    location: Location;
    accountable_person: User | null;
    accountable_person_name: string | null;
    date_acquired: string;
    qr_code: string | null;
    qr_code_path: string | null;
}

interface Props {
    item: Item;
}

export default function PrintQr({ item }: Props) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Items',
                    href: '/items',
                },
                {
                    title: item.property_number,
                    href: `/items/${item.id}`,
                },
                {
                    title: 'Print QR Code',
                    href: '#',
                },
            ]}
        >
            <Head title={`Print QR Code - ${item.property_number}`} />

            <div className="space-y-4">
                <div className="flex items-center gap-4 print:hidden">
                    <Link href={`/items/${item.id}`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Print QR Code
                        </h1>
                        <p className="text-muted-foreground">
                            {item.property_number}
                        </p>
                    </div>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>

                {/* Printable QR Code Label */}
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">EARIST Property Label</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* QR Code Display */}
                            {item.qr_code_path ? (
                                <div className="flex justify-center">
                                    <div className="bg-white p-4 rounded-lg border-4 border-black">
                                        <img
                                            src={`/storage/${item.qr_code_path}`}
                                            alt={`QR Code for ${item.property_number}`}
                                            className="w-64 h-64"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <div className="bg-gray-100 p-4 rounded-lg border-4 border-gray-300 w-64 h-64 flex items-center justify-center">
                                        <p className="text-gray-500 text-center">No QR Code Generated</p>
                                    </div>
                                </div>
                            )}

                            {/* Item Information */}
                            <div className="space-y-4 text-center border-t pt-6">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Property Number</p>
                                    <p className="text-2xl font-bold font-mono">{item.property_number}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Item Description</p>
                                    <p className="text-lg font-semibold">
                                        {item.brand} {item.model || item.name}
                                    </p>
                                    {item.serial_number && (
                                        <p className="text-sm text-muted-foreground">S/N: {item.serial_number}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">IAR Number</p>
                                        <p className="font-mono text-sm">{item.iar_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Category</p>
                                        <p className="text-sm">{item.category.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Location</p>
                                        <p className="text-sm">{item.location.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase">Date Acquired</p>
                                        <p className="text-sm">
                                            {new Date(item.date_acquired).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {(item.accountable_person || item.accountable_person_name) && (
                                    <div className="border-t pt-4">
                                        <p className="text-xs text-muted-foreground uppercase">Accountable Person</p>
                                        <p className="font-semibold">
                                            {item.accountable_person?.name || item.accountable_person_name}
                                        </p>
                                    </div>
                                )}

                                {item.qr_code && (
                                    <div className="border-t pt-4">
                                        <p className="text-xs text-muted-foreground uppercase">QR Code ID</p>
                                        <p className="font-mono text-sm">{item.qr_code}</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
                                <p>Eulogio "Amang" Rodriguez Institute of Science and Technology</p>
                                <p>Management Information System Office</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Print Instructions */}
                <div className="print:hidden max-w-4xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Print Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>• Click the "Print" button above or press Ctrl+P (Cmd+P on Mac)</p>
                            <p>• Recommended: Use adhesive label paper (4" x 3" or similar)</p>
                            <p>• Ensure "Print backgrounds" is enabled for best results</p>
                            <p>• For best QR code scanning, maintain high print quality</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: 4in 3in;
                        margin: 0.25in;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </AppLayout>
    );
}
