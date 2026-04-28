<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'ingredients'])->where('is_active', true);

        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        if ($request->has('min_ph')) {
            $query->where('ph_level', '>=', $request->min_ph);
        }

        if ($request->has('max_ph')) {
            $query->where('ph_level', '<=', $request->max_ph);
        }

        if ($request->has('texture')) {
            $query->where('texture', $request->texture);
        }

        if ($request->has('ingredients')) {
            $ingredientList = explode(',', $request->ingredients);
            foreach ($ingredientList as $ingredient) {
                $query->whereHas('ingredients', function($q) use ($ingredient) {
                    $q->where('name', trim($ingredient));
                });
            }
        }

        return response()->json($query->paginate(12));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:products',
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
            'cost_price' => 'required|numeric',
            'selling_price' => 'required|numeric',
            'stock' => 'integer',
            'ph_level' => 'nullable|numeric',
            'texture' => 'nullable|string',
        ]);

        $product = Product::create($validated);

        if ($request->has('ingredients')) {
            $product->ingredients()->attach($request->ingredients);
        }

        return response()->json($product->load(['category', 'ingredients']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Product::with(['category', 'ingredients'])->findOrFail($id);
        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'code' => 'unique:products,code,' . $id,
            'name' => 'string',
            'category_id' => 'exists:categories,id',
            'cost_price' => 'numeric',
            'selling_price' => 'numeric',
            'stock' => 'integer',
            'ph_level' => 'nullable|numeric',
            'texture' => 'nullable|string',
        ]);

        $product->update($validated);

        if ($request->has('ingredients')) {
            $product->ingredients()->sync($request->ingredients);
        }

        return response()->json($product->load(['category', 'ingredients']));
    }

    /**
     * Remove the specified resource in storage.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(null, 204);
    }
}
