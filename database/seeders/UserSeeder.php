<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin — manages products, categories, views all orders + reports
        User::create([
            'name'     => 'Admin Saint Claire',
            'email'    => 'admin@saintclaire.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // Customer — shops, carts, orders
        User::create([
            'name'     => 'Customer Exclusive',
            'email'    => 'customer@gmail.com',
            'password' => Hash::make('password'),
            'role'     => 'customer',
            'tier'     => 'exclusive',
        ]);
    }
}
