<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Payment
            $table->string('payment_method')->default('cod')->after('payment_status');
            // 'cod' | 'midtrans'
            $table->string('payment_token')->nullable()->after('payment_method');
            // Midtrans snap token
            $table->string('midtrans_transaction_id')->nullable()->after('payment_token');

            // Shipping
            $table->decimal('shipping_cost', 15, 2)->default(0)->after('courier');
            $table->string('city_origin')->default('501')->after('shipping_cost');
            // default kota asal (kode RajaOngkir)
            $table->string('city_destination')->nullable()->after('city_origin');
            // kode kota tujuan RajaOngkir
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method', 'payment_token', 'midtrans_transaction_id',
                'shipping_cost', 'city_origin', 'city_destination',
            ]);
        });
    }
};
