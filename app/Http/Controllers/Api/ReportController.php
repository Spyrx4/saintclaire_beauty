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
}
