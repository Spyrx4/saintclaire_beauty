<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    public function index()
    {
        return response()->json(Ingredient::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:ingredients',
            'description' => 'nullable|string',
        ]);

        $ingredient = Ingredient::create($validated);
        return response()->json($ingredient, 201);
    }

    public function show(string $id)
    {
        return response()->json(Ingredient::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $ingredient = Ingredient::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|unique:ingredients,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $ingredient->update($validated);
        return response()->json($ingredient);
    }

    public function destroy(string $id)
    {
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->delete();
        return response()->json(null, 204);
    }
}
