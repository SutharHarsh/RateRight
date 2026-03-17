'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, FileDown, Plus } from 'lucide-react';

interface CalculationItem {
  id: string;
  createdAt: string;
  platform: string;
  followerCount: number;
  engagementRate: number;
  niche: string;
  recommendedRate: number;
}

export default function CalculationsPage() {
  const router = useRouter();
  const [calculations, setCalculations] = useState<CalculationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalculations();
  }, []);

  const fetchCalculations = async () => {
    setLoading(true);
    const response = await fetch('/api/calculations/list', { cache: 'no-store' });

    if (!response.ok) {
      setCalculations([]);
      setLoading(false);
      return;
    }

    const data = (await response.json()) as { calculations?: CalculationItem[] };
    setCalculations(data.calculations || []);
    setLoading(false);
  };

  const exportToCSV = () => {
    if (calculations.length === 0) {
      window.alert('No calculations to export');
      return;
    }

    const headers = ['Date', 'Platform', 'Followers', 'Engagement Rate', 'Niche', 'Recommended Rate'];
    const rows = calculations.map((calc) => [
      new Date(calc.createdAt).toLocaleDateString(),
      calc.platform,
      calc.followerCount,
      `${calc.engagementRate}%`,
      calc.niche,
      `$${(calc.recommendedRate / 100).toFixed(0)}`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RateRight_Calculations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (calculations.length === 0) {
      window.alert('No calculations to export');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Rate Calculations History', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = calculations.map((calc) => [
      new Date(calc.createdAt).toLocaleDateString(),
      calc.platform,
      calc.followerCount.toLocaleString(),
      `${calc.engagementRate}%`,
      calc.niche,
      `$${(calc.recommendedRate / 100).toFixed(0)}`,
    ]);

    autoTable(doc, {
      head: [['Date', 'Platform', 'Followers', 'Engagement', 'Niche', 'Rate']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`RateRight_Calculations_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calculation History</h1>
          <p className="text-gray-600 mt-1">View and export all your rate calculations</p>
        </div>
        <Link href="/calculator">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Calculation
          </Button>
        </Link>
      </div>

      <Card className="p-6 mb-6 bg-black border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-1 text-white">Export Your Data</h3>
            <p className="text-sm text-slate-400">Download all your calculations as CSV or PDF</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV} disabled={calculations.length === 0 || loading}>
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportToPDF} disabled={calculations.length === 0 || loading}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Niche</TableHead>
              <TableHead className="text-right">Recommended Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calculations.map((calc) => (
              <TableRow
                key={calc.id}
                className="cursor-pointer transition-colors hover:bg-slate-800/60 data-[state=selected]:bg-slate-800/80"
                onClick={() => router.push(`/calculator/results?id=${calc.id}`)}
              >
                <TableCell>{new Date(calc.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{calc.platform}</TableCell>
                <TableCell>{calc.followerCount.toLocaleString()}</TableCell>
                <TableCell>{calc.engagementRate}%</TableCell>
                <TableCell>{calc.niche}</TableCell>
                <TableCell className="text-right font-semibold">${(calc.recommendedRate / 100).toFixed(0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!loading && calculations.length === 0 && (
          <div className="text-center py-12 text-gray-500">No calculations yet. Use the calculator to get started.</div>
        )}
      </Card>
    </div>
  );
}
