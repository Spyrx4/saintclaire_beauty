<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:categories',
        ]);

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function show(string $id)
    {
        return response()->json(Category::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|unique:categories,name,' . $id,
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(null, 204);
    }
}
