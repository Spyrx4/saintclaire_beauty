<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchLog extends Model
{
    protected $fillable = ['user_id', 'query'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
