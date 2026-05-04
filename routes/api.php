<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\IngredientController;
use App\Http\Controllers\Api\KasirController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ShippingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ─── Public Routes ───────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Public catalog
Route::get('/products',             [ProductController::class, 'index']);
Route::get('/products/{product}',   [ProductController::class, 'show']);
Route::get('/categories',           [CategoryController::class, 'index']);
Route::get('/categories/{category}',[CategoryController::class, 'show']);
Route::get('/ingredients',          [IngredientController::class, 'index']);
Route::get('/ingredients/{ingredient}', [IngredientController::class, 'show']);

// Shipping costs — public (no auth needed, customer fills in checkout)
Route::get('/shipping/costs',  [ShippingController::class, 'getCosts']);
Route::get('/shipping/cities', [ShippingController::class, 'getCities']);

// Midtrans webhook — public (called by Midtrans servers)
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

// ─── Authenticated Routes ────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user',   fn(Request $r) => $r->user());
    Route::post('/logout', [AuthController::class, 'logout']);

    // ─── Customer Only ───────────────────────────────────────
    Route::middleware('role:customer')->group(function () {
        // Cart
        Route::get('/cart',                    [CartController::class, 'index']);
        Route::post('/cart/add',               [CartController::class, 'addItem']);
        Route::put('/cart/items/{itemId}',     [CartController::class, 'updateItem']);
        Route::delete('/cart/items/{itemId}',  [CartController::class, 'removeItem']);
        Route::delete('/cart/clear',           [CartController::class, 'clear']);

        // Orders (own only)
        Route::get('/orders',              [OrderController::class, 'index']);
        Route::post('/orders/checkout',    [OrderController::class, 'store']);
        Route::get('/orders/{id}',         [OrderController::class, 'show']);
        Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

        // Payment — buat Midtrans snap token
        Route::post('/payment/snap-token', [PaymentController::class, 'createSnapToken']);
    });

    // ─── Kasir Only ──────────────────────────────────────────
    Route::middleware('role:kasir')->group(function () {
        Route::get('/kasir/orders',                [KasirController::class, 'index']);
        Route::get('/kasir/orders/{id}',           [KasirController::class, 'show']);
        Route::put('/kasir/orders/{id}/status',    [KasirController::class, 'updateStatus']);
        Route::post('/kasir/orders/{id}/cod',      [PaymentController::class, 'confirmCod']);
    });

    // ─── Admin Only ──────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        // Product CRUD
        Route::post('/products',            [ProductController::class, 'store']);
        Route::put('/products/{product}',   [ProductController::class, 'update']);
        Route::delete('/products/{product}',[ProductController::class, 'destroy']);

        // Category & Ingredient CRUD
        Route::post('/categories',              [CategoryController::class, 'store']);
        Route::put('/categories/{category}',    [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        Route::post('/ingredients',             [IngredientController::class, 'store']);
        Route::put('/ingredients/{ingredient}', [IngredientController::class, 'update']);
        Route::delete('/ingredients/{ingredient}', [IngredientController::class, 'destroy']);

        // Admin order management
        Route::get('/admin/orders',                 [OrderController::class, 'allOrders']);
        Route::put('/admin/orders/{id}/status',     [OrderController::class, 'updateStatus']);
    });

    // ─── Owner + Admin (Reports) ─────────────────────────────
    Route::middleware('role:owner,admin')->prefix('reports')->group(function () {
        Route::get('/monthly-sales',         [ReportController::class, 'monthlySales']);
        Route::get('/inventory',             [ReportController::class, 'inventory']);
        Route::get('/best-sellers',          [ReportController::class, 'bestSellers']);
        Route::get('/exclusive-customers',   [ReportController::class, 'exclusiveCustomers']);
        Route::get('/critical-stock',        [ReportController::class, 'criticalStock']);
        Route::get('/cancelled-transactions',[ReportController::class, 'cancelledTransactions']);
        Route::get('/profit-loss',           [ReportController::class, 'profitLoss']);
        Route::get('/audit-trail',           [ReportController::class, 'auditTrail']);
        Route::get('/ingredient-analysis',   [ReportController::class, 'ingredientAnalysis']);
        Route::get('/export-pdf',            [ReportController::class, 'exportPdf']);
    });
});
