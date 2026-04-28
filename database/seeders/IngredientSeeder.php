<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use Illuminate\Database\Seeder;

class IngredientSeeder extends Seeder
{
    public function run(): void
    {
        $ingredients = [
            ['name' => 'Retinol', 'description' => 'Anti-aging and skin renewal.'],
            ['name' => 'Vitamin C', 'description' => 'Brightening and antioxidant.'],
            ['name' => 'Niacinamide', 'description' => 'Oil control and barrier repair.'],
            ['name' => 'Hyaluronic Acid', 'description' => 'Hydration and plumping.'],
            ['name' => 'Salicylic Acid', 'description' => 'Acne treatment and exfoliation.'],
            ['name' => 'Ceramides', 'description' => 'Skin barrier strengthening.'],
        ];

        foreach ($ingredients as $ingredient) {
            Ingredient::create($ingredient);
        }
    }
}
