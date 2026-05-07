<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\Product;
use App\Models\SearchLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * 1. Laporan Penjualan Bulanan
     */
    public function monthlySales(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $sales = Order::with('user')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->get();

        return response()->json($sales);
    }

    /**
     * 2. Laporan Inventaris Barang
     */
    public function inventory()
    {
        $inventory = Product::select('code', 'name', 'ph_level', 'stock', 'selling_price')->get();
        return response()->json($inventory);
    }

    /**
     * 3. Laporan Produk Terlaris (Fast Moving)
     */
    public function bestSellers()
    {
        $bestSellers = Product::with(['ingredients', 'category'])
            ->withCount(['orderItems as total_sold' => function($query) {
                $query->select(DB::raw('sum(quantity)'));
            }])
            ->orderByDesc('total_sold')
            ->get();

        return response()->json($bestSellers);
    }

    /**
     * 4. Laporan Data Pelanggan Eksklusif
     */
    public function exclusiveCustomers()
    {
        $customers = User::where('tier', '!=', 'regular')
            ->withCount('orders')
            ->get();
        return response()->json($customers);
    }

    /**
     * 5. Laporan Stok Kritis
     */
    public function criticalStock()
    {
        $critical = Product::whereColumn('stock', '<=', 'threshold')->get();
        return response()->json($critical);
    }

    /**
     * 8. Laporan Transaksi Dibatalkan
     */
    public function cancelledTransactions()
    {
        $cancelled = Order::with('user')
            ->where('status', 'cancelled')
            ->get();
        return response()->json($cancelled);
    }

    /**
     * 9. Laporan Laba Rugi Produk
     */
    public function profitLoss()
    {
        $products = Product::select(
            'name', 
            'cost_price', 
            'selling_price',
            DB::raw('(selling_price - cost_price) as margin_value'),
            DB::raw('((selling_price - cost_price) / cost_price * 100) as margin_percentage')
        )->get();

        return response()->json($products);
    }

    /**
     * 10. Log Aktivitas Admin (Audit Trail)
     */
    public function auditTrail()
    {
        $logs = ActivityLog::with('user')->latest()->get();
        return response()->json($logs);
    }

    /**
     * 11. Laporan Analisis Bahan Aktif (Preskriptif)
     */
    public function ingredientAnalysis()
    {
        // Simple analysis: match search queries with ingredients
        $ingredients = Ingredient::withCount(['products'])->get();
        
        $searchTrends = SearchLog::select('query', DB::raw('count(*) as count'))
            ->groupBy('query')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        return response()->json([
            'ingredients' => $ingredients,
            'search_trends' => $searchTrends
        ]);
    }

    /**
     * Export any report to PDF using FPDF
     */
    public function exportPdf(Request $request)
    {
        $type = $request->input('type');

        // Load FPDF manually
        require_once app_path('Libraries/fpdf.php');

        $data = [];
        $title = "Report";
        $columns = [];

        switch ($type) {
            case 'monthly-sales':
                $title = 'Laporan Penjualan Bulanan';
                $data = $this->monthlySales($request)->getData(true);
                $columns = [
                    ['header' => 'Tgl Transaksi', 'key' => 'created_at', 'width' => 40, 'format' => 'datetime'],
                    ['header' => 'No. Invoice', 'key' => 'invoice_number', 'width' => 50],
                    ['header' => 'Pelanggan', 'key' => 'user.name', 'width' => 60],
                    ['header' => 'Total', 'key' => 'total_amount', 'width' => 40, 'format' => 'currency', 'align' => 'R'],
                    ['header' => 'Status', 'key' => 'status', 'width' => 40, 'align' => 'C'],
                ];
                break;
            case 'inventory':
                $title = 'Laporan Inventaris Barang';
                $data = $this->inventory()->getData(true);
                $columns = [
                    ['header' => 'Kode', 'key' => 'code', 'width' => 30],
                    ['header' => 'Nama Produk', 'key' => 'name', 'width' => 100],
                    ['header' => 'pH Level', 'key' => 'ph_level', 'width' => 30, 'align' => 'C'],
                    ['header' => 'Stok', 'key' => 'stock', 'width' => 30, 'align' => 'C'],
                    ['header' => 'Harga Jual', 'key' => 'selling_price', 'width' => 50, 'format' => 'currency', 'align' => 'R'],
                ];
                break;
            case 'best-sellers':
                $title = 'Laporan Produk Terlaris';
                $data = $this->bestSellers()->getData(true);
                $columns = [
                    ['header' => 'Nama Produk', 'key' => 'name', 'width' => 120],
                    ['header' => 'Kategori', 'key' => 'category.name', 'width' => 60],
                    ['header' => 'Stok Saat Ini', 'key' => 'stock', 'width' => 40, 'align' => 'C'],
                    ['header' => 'Total Terjual', 'key' => 'total_sold', 'width' => 40, 'align' => 'C'],
                ];
                break;
            case 'exclusive-customers':
                $title = 'Laporan Pelanggan Eksklusif';
                $data = $this->exclusiveCustomers()->getData(true);
                $columns = [
                    ['header' => 'Nama Pelanggan', 'key' => 'name', 'width' => 80],
                    ['header' => 'Email', 'key' => 'email', 'width' => 80],
                    ['header' => 'Tier', 'key' => 'tier', 'width' => 40, 'align' => 'C'],
                    ['header' => 'Total Pesanan', 'key' => 'orders_count', 'width' => 40, 'align' => 'C'],
                ];
                break;
            case 'critical-stock':
                $title = 'Laporan Stok Kritis';
                $data = $this->criticalStock()->getData(true);
                $columns = [
                    ['header' => 'Nama Produk', 'key' => 'name', 'width' => 120],
                    ['header' => 'Stok Saat Ini', 'key' => 'stock', 'width' => 40, 'align' => 'C'],
                    ['header' => 'Ambang Batas', 'key' => 'threshold', 'width' => 40, 'align' => 'C'],
                    ['header' => 'Status', 'key' => 'id', 'width' => 50, 'format' => 'custom', 'callback' => function($v) { return 'Perlu Restock'; }],
                ];
                break;
            case 'cancelled-transactions':
                $title = 'Laporan Transaksi Dibatalkan';
                $data = $this->cancelledTransactions()->getData(true);
                $columns = [
                    ['header' => 'Tgl Batal', 'key' => 'updated_at', 'width' => 45, 'format' => 'datetime'],
                    ['header' => 'No. Invoice', 'key' => 'invoice_number', 'width' => 55],
                    ['header' => 'Pelanggan', 'key' => 'user.name', 'width' => 70],
                    ['header' => 'Total Tagihan', 'key' => 'total_amount', 'width' => 50, 'format' => 'currency', 'align' => 'R'],
                ];
                break;
            case 'profit-loss':
                $title = 'Laporan Laba Rugi Produk';
                $data = $this->profitLoss()->getData(true);
                $columns = [
                    ['header' => 'Nama Produk', 'key' => 'name', 'width' => 90],
                    ['header' => 'Harga Modal', 'key' => 'cost_price', 'width' => 45, 'format' => 'currency', 'align' => 'R'],
                    ['header' => 'Harga Jual', 'key' => 'selling_price', 'width' => 45, 'format' => 'currency', 'align' => 'R'],
                    ['header' => 'Margin (Rp)', 'key' => 'margin_value', 'width' => 45, 'format' => 'currency', 'align' => 'R'],
                    ['header' => 'Margin (%)', 'key' => 'margin_percentage', 'width' => 35, 'format' => 'percentage', 'align' => 'R'],
                ];
                break;
            case 'audit-trail':
                $title = 'Log Aktivitas Admin (Audit Trail)';
                $data = $this->auditTrail()->getData(true);
                $columns = [
                    ['header' => 'Waktu', 'key' => 'created_at', 'width' => 45, 'format' => 'datetime'],
                    ['header' => 'User', 'key' => 'user.name', 'width' => 50],
                    ['header' => 'Aktivitas', 'key' => 'activity', 'width' => 50],
                    ['header' => 'Keterangan', 'key' => 'description', 'width' => 110],
                ];
                break;
            case 'ingredient-analysis':
                $title = 'Laporan Analisis Bahan Aktif';
                $res = $this->ingredientAnalysis()->getData(true);
                $data = $res['ingredients'] ?? [];
                $columns = [
                    ['header' => 'Nama Bahan', 'key' => 'name', 'width' => 100],
                    ['header' => 'Fungsi', 'key' => 'function', 'width' => 100],
                    ['header' => 'Jumlah Produk', 'key' => 'products_count', 'width' => 50, 'align' => 'C'],
                ];
                break;
            default:
                $title = 'Laporan';
                $data = [];
                break;
        }

        // Custom FPDF Class
        $pdf = new class('L', 'mm', 'A4') extends \FPDF {
            public $reportTitle;
            function Header() {
                $logoPath = public_path('logo.png');
                if (file_exists($logoPath)) {
                    // Detect if it's actually a JPEG even if named .png
                    $imgData = file_get_contents($logoPath, false, null, 0, 4);
                    $type = '';
                    if (strpos($imgData, "\x89PNG") === 0) $type = 'PNG';
                    elseif (strpos($imgData, "\xff\xd8") === 0) $type = 'JPG';
                    
                    try {
                        if ($type) {
                            $this->Image($logoPath, 10, 6, 20, 0, $type);
                        } else {
                            $this->Image($logoPath, 10, 6, 20);
                        }
                    } catch (\Exception $e) {
                        // Skip logo if it still fails
                    }
                }
                $this->SetFont('Arial', 'B', 15);
                $this->Cell(80);
                $this->Cell(110, 10, 'SAINT CLAIRE BEAUTY', 0, 0, 'C');
                $this->Ln(8);
                $this->SetFont('Arial', 'I', 10);
                $this->Cell(80);
                $this->Cell(110, 10, $this->reportTitle, 0, 0, 'C');
                $this->Ln(15);
                
                // Horizontal line
                $this->Line(10, 32, 287, 32);
                $this->Ln(5);
            }

            function Footer() {
                $this->SetY(-15);
                $this->SetFont('Arial', 'I', 8);
                $this->Cell(0, 10, 'Halaman ' . $this->PageNo() . '/{nb}', 0, 0, 'C');
                $this->Cell(0, 10, 'Dicetak pada: ' . date('d/m/Y H:i'), 0, 0, 'R');
            }
        };

        $pdf->reportTitle = $title;
        $pdf->AliasNbPages();
        $pdf->AddPage();
        
        if (count($data) > 0 && count($columns) > 0) {
            // Header Table
            $pdf->SetFillColor(230, 230, 230);
            $pdf->SetFont('Arial', 'B', 10);
            foreach ($columns as $col) {
                $pdf->Cell($col['width'], 10, $col['header'], 1, 0, 'C', true);
            }
            $pdf->Ln();

            // Data Table
            $pdf->SetFont('Arial', '', 9);
            foreach ($data as $row) {
                $maxLine = 1;
                // Pre-calculate heights if needed for MultiCell, but for simplicity let's stick to Cell
                // and just handle nested keys
                
                foreach ($columns as $col) {
                    $val = $this->getNestedValue($row, $col['key']);
                    
                    // Formatting
                    if (isset($col['format'])) {
                        if ($col['format'] == 'currency' && is_numeric($val)) {
                            $val = 'Rp ' . number_format((float)$val, 0, ',', '.');
                        } elseif ($col['format'] == 'percentage' && is_numeric($val)) {
                            $val = number_format((float)$val, 2) . '%';
                        } elseif ($col['format'] == 'datetime' && $val && $val !== '-') {
                            $val = date('d/m/Y H:i', strtotime($val));
                        } elseif ($col['format'] == 'custom' && isset($col['callback'])) {
                            $val = $col['callback']($val);
                        }
                    }

                    $align = $col['align'] ?? 'L';
                    
                    // Use Cell with truncation or MultiCell? 
                    // To keep it simple and aligned, use Cell but with better width management
                    $pdf->Cell($col['width'], 8, substr((string)$val, 0, 50), 1, 0, $align);
                }
                $pdf->Ln();
            }
        } else {
            $pdf->SetFont('Arial', 'I', 12);
            $pdf->Cell(0, 10, 'Tidak ada data untuk laporan ini.', 0, 1, 'C');
        }

        return response($pdf->Output('S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.\Illuminate\Support\Str::slug($title).'-'.date('Ymd').'.pdf"',
        ]);
    }

    /**
     * Helper to get nested value from array using dot notation
     */
    private function getNestedValue($data, $key)
    {
        foreach (explode('.', $key) as $segment) {
            if (isset($data[$segment])) {
                $data = $data[$segment];
            } else {
                return '-';
            }
        }
        return $data;
    }
}
