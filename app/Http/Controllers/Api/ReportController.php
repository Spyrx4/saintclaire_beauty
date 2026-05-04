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
        $bestSellers = Product::with('ingredients')
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

        switch ($type) {
            case 'monthly-sales':
                $title = 'Monthly Sales';
                $data = $this->monthlySales($request)->getData(true);
                break;
            case 'inventory':
                $title = 'Inventory';
                $data = $this->inventory()->getData(true);
                break;
            case 'best-sellers':
                $title = 'Best Sellers';
                $data = $this->bestSellers()->getData(true);
                break;
            case 'exclusive-customers':
                $title = 'Exclusive Customers';
                $data = $this->exclusiveCustomers()->getData(true);
                break;
            case 'critical-stock':
                $title = 'Critical Stock';
                $data = $this->criticalStock()->getData(true);
                break;
            case 'cancelled-transactions':
                $title = 'Cancelled Transactions';
                $data = $this->cancelledTransactions()->getData(true);
                break;
            case 'profit-loss':
                $title = 'Profit Loss';
                $data = $this->profitLoss()->getData(true);
                break;
            case 'audit-trail':
                $title = 'Audit Trail';
                $data = $this->auditTrail()->getData(true);
                break;
            case 'ingredient-analysis':
                $title = 'Ingredient Analysis';
                $res = $this->ingredientAnalysis()->getData(true);
                $data = $res['ingredients'] ?? [];
                break;
            default:
                $title = 'Unknown Report';
                $data = [];
                break;
        }

        $fpdf = new \FPDF('L', 'mm', 'A4');
        $fpdf->AddPage();
        
        // Header
        $fpdf->SetFont('Arial', 'B', 16);
        $fpdf->Cell(0, 10, 'Saint Claire Beauty - ' . $title, 0, 1, 'C');
        $fpdf->SetFont('Arial', '', 10);
        $fpdf->Cell(0, 8, 'Generated on: ' . now()->format('Y-m-d H:i:s'), 0, 1, 'C');
        $fpdf->Ln(5);

        if (count($data) > 0) {
            $fpdf->SetFont('Arial', 'B', 10);
            
            // Extract headers (ignore complex objects/arrays)
            $firstRow = $data[0];
            $headers = [];
            $keys = [];
            foreach (array_keys($firstRow) as $key) {
                if (!is_array($firstRow[$key])) {
                    $headers[] = ucwords(str_replace('_', ' ', $key));
                    $keys[] = $key;
                }
            }

            // Calculate width dynamically
            $totalWidth = 277; // A4 Landscape width minus margins
            $colCount = count($headers) > 0 ? count($headers) : 1;
            
            // Assign specific widths if possible, otherwise distribute evenly
            $colWidth = $totalWidth / $colCount;

            // Print table header
            foreach ($headers as $header) {
                // Shorten header text if necessary
                $fpdf->Cell($colWidth, 10, substr($header, 0, 20), 1, 0, 'C');
            }
            $fpdf->Ln();

            // Print table data
            $fpdf->SetFont('Arial', '', 9);
            foreach ($data as $idx => $row) {
                foreach ($keys as $key) {
                    $val = $row[$key] ?? '-';
                    if (is_bool($val)) $val = $val ? 'Yes' : 'No';
                    $valStr = (string)$val;
                    
                    // Truncate to fit column visually
                    if (strlen($valStr) > 25) {
                        $valStr = substr($valStr, 0, 22) . '...';
                    }
                    $fpdf->Cell($colWidth, 10, $valStr, 1, 0, 'L');
                }
                $fpdf->Ln();
            }
        } else {
            $fpdf->SetFont('Arial', '', 12);
            $fpdf->Cell(0, 10, 'No data available for this report.', 0, 1, 'C');
        }

        $pdfContent = $fpdf->Output('S');
        
        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.\Illuminate\Support\Str::slug($title).'-report.pdf"',
        ]);
    }
}
