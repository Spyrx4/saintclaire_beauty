<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $serum = Category::where('name', 'Serum')->first();
        $moisturizer = Category::where('name', 'Moisturizer')->first();
        $toner = Category::where('name', 'Toner')->first();

        $retinol = Ingredient::where('name', 'Retinol')->first();
        $niacinamide = Ingredient::where('name', 'Niacinamide')->first();
        $hyaluronic = Ingredient::where('name', 'Hyaluronic Acid')->first();
        $vitaminC = Ingredient::where('name', 'Vitamin C')->first();

        // Product 1: Retinol Serum
        $p1 = Product::create([
            'code' => 'SC-RE-001',
            'name' => 'Midnight Renewal Retinol Serum',
            'category_id' => $serum->id,
            'description' => 'A potent retinol serum for nighttime use.',
            'ph_level' => 5.5,
            'texture' => 'Lightweight Oil-Free Serum',
            'cost_price' => 120000,
            'selling_price' => 250000,
            'stock' => 50,
            'threshold' => 10,
            'supplier' => 'Claire Labs',
        ]);
        $p1->ingredients()->attach([$retinol->id, $hyaluronic->id]);

        // Product 2: Niacinamide Moisturizer
        $p2 = Product::create([
            'code' => 'SC-NI-001',
            'name' => 'Barrier Boost Niacinamide Cream',
            'category_id' => $moisturizer->id,
            'description' => 'Daily moisturizer with 5% Niacinamide.',
            'ph_level' => 6.0,
            'texture' => 'Creamy Gel',
            'cost_price' => 85000,
            'selling_price' => 175000,
            'stock' => 100,
            'threshold' => 15,
            'supplier' => 'Claire Labs',
        ]);
        $p2->ingredients()->attach([$niacinamide->id]);

        // Product 3: Vitamin C Toner
        $p3 = Product::create([
            'code' => 'SC-VC-001',
            'name' => 'Glow Essence Vitamin C Toner',
            'category_id' => $toner->id,
            'description' => 'Brightening toner with stable Vitamin C.',
            'ph_level' => 4.5,
            'texture' => 'Liquid Water-like',
            'cost_price' => 60000,
            'selling_price' => 135000,
            'stock' => 8, // Critical stock!
            'threshold' => 10,
            'supplier' => 'Claire Labs',
        ]);
        $p3->ingredients()->attach([$vitaminC->id]);
    }
}
