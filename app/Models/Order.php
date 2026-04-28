<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'total_price',
        'status', 'payment_status', 'payment_method',
        'payment_token', 'midtrans_transaction_id',
        'shipping_address', 'courier', 'tracking_number',
        'shipping_cost', 'city_origin', 'city_destination', 'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
