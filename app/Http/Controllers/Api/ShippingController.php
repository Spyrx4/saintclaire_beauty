<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShippingController extends Controller
{
    /**
     * Hitung ongkos kirim via RajaOngkir.
     * Jika API key belum dikonfigurasi, kembalikan daftar kurir statis.
     */
    public function getCosts(Request $request)
    {
        $request->validate([
            'destination' => 'required|string',
            'weight'      => 'required|integer|min:1',
            'courier'     => 'required|string', // jne|tiki|pos|sicepat|jnt
        ]);

        $apiKey  = env('RAJAONGKIR_API_KEY', '');
        $baseUrl = env('RAJAONGKIR_BASE_URL', 'https://api.rajaongkir.com/starter');
        $origin  = env('RAJAONGKIR_ORIGIN_CITY', '501');

        // ── Jika API key belum diisi → kembalikan data statis ──
        if (empty($apiKey) || $apiKey === 'YOUR_RAJAONGKIR_API_KEY') {
            return response()->json([
                'source' => 'static',
                'note'   => 'RajaOngkir API key belum dikonfigurasi. Gunakan data statis berikut.',
                'costs'  => $this->staticCosts($request->courier, (int) $request->weight),
            ]);
        }

        // ── Panggil RajaOngkir API ──
        try {
            $response = Http::withHeaders(['key' => $apiKey])
                ->post("{$baseUrl}/cost", [
                    'origin'      => $origin,
                    'destination' => $request->destination,
                    'weight'      => $request->weight,
                    'courier'     => $request->courier,
                ]);

            $data = $response->json();

            if ($response->failed() || !isset($data['rajaongkir']['results'])) {
                return response()->json([
                    'source' => 'static',
                    'note'   => 'RajaOngkir API error. Menggunakan data statis.',
                    'costs'  => $this->staticCosts($request->courier, (int) $request->weight),
                ]);
            }

            return response()->json([
                'source' => 'rajaongkir',
                'costs'  => $data['rajaongkir']['results'],
            ]);

        } catch (\Exception $e) {
            Log::error('RajaOngkir error: ' . $e->getMessage());
            return response()->json([
                'source' => 'static',
                'note'   => 'Koneksi RajaOngkir gagal. Menggunakan data statis.',
                'costs'  => $this->staticCosts($request->courier, (int) $request->weight),
            ]);
        }
    }

    /**
     * Daftar kota dari RajaOngkir (untuk dropdown tujuan).
     */
    public function getCities(Request $request)
    {
        $apiKey  = env('RAJAONGKIR_API_KEY', '');
        $baseUrl = env('RAJAONGKIR_BASE_URL', 'https://api.rajaongkir.com/starter');

        if (empty($apiKey) || $apiKey === 'YOUR_RAJAONGKIR_API_KEY') {
            return response()->json([
                'source' => 'static',
                'cities' => $this->staticCities(),
            ]);
        }

        try {
            $response = Http::withHeaders(['key' => $apiKey])
                ->get("{$baseUrl}/city");

            $data = $response->json();
            return response()->json([
                'source' => 'rajaongkir',
                'cities' => $data['rajaongkir']['results'] ?? [],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'source' => 'static',
                'cities' => $this->staticCities(),
            ]);
        }
    }

    /**
     * Data ongkir statis — fallback jika API belum dikonfigurasi.
     * Harga dalam Rupiah per 1000g (1kg).
     */
    private function staticCosts(string $courier, int $weightGram): array
    {
        $weightKg = ceil($weightGram / 1000);
        $couriers = [
            'jne'     => [
                ['service' => 'REG',  'description' => 'Layanan Reguler',    'cost' => 15000 * $weightKg, 'etd' => '2-3'],
                ['service' => 'YES',  'description' => 'Yakin Esok Sampai',  'cost' => 35000 * $weightKg, 'etd' => '1-1'],
                ['service' => 'OKE',  'description' => 'Ongkos Kirim Ekonomis', 'cost' => 12000 * $weightKg, 'etd' => '3-5'],
            ],
            'tiki'    => [
                ['service' => 'REG',  'description' => 'Reguler',            'cost' => 14000 * $weightKg, 'etd' => '2-4'],
                ['service' => 'ONS',  'description' => 'Over Night Service', 'cost' => 32000 * $weightKg, 'etd' => '1-1'],
            ],
            'pos'     => [
                ['service' => 'Paket Biasa',   'description' => 'Pos Reguler',  'cost' => 10000 * $weightKg, 'etd' => '4-7'],
            ],
            'sicepat' => [
                ['service' => 'BEST', 'description' => 'Best Express',       'cost' => 13000 * $weightKg, 'etd' => '2-3'],
                ['service' => 'GOKIL','description' => 'Go Kilat',           'cost' => 25000 * $weightKg, 'etd' => '1-2'],
            ],
            'jnt'     => [
                ['service' => 'EZ',   'description' => 'J&T Express',        'cost' => 13000 * $weightKg, 'etd' => '2-3'],
            ],
        ];

        $results = $couriers[strtolower($courier)] ?? $couriers['jne'];

        return [[
            'code'  => strtoupper($courier),
            'name'  => strtoupper($courier),
            'costs' => array_map(fn($c) => [
                'service'     => $c['service'],
                'description' => $c['description'],
                'cost'        => [['value' => $c['cost'], 'etd' => $c['etd'] . ' hari', 'note' => '']],
            ], $results),
        ]];
    }

    /**
     * Daftar kota statis — fallback jika API belum dikonfigurasi.
     */
    private function staticCities(): array
    {
        return [
            ['city_id' => '501', 'city_name' => 'Jakarta Pusat',   'province' => 'DKI Jakarta'],
            ['city_id' => '114', 'city_name' => 'Depok',           'province' => 'Jawa Barat'],
            ['city_id' => '80',  'city_name' => 'Bogor',           'province' => 'Jawa Barat'],
            ['city_id' => '23',  'city_name' => 'Bandung',         'province' => 'Jawa Barat'],
            ['city_id' => '444', 'city_name' => 'Surabaya',        'province' => 'Jawa Timur'],
            ['city_id' => '399', 'city_name' => 'Semarang',        'province' => 'Jawa Tengah'],
            ['city_id' => '255', 'city_name' => 'Makassar',        'province' => 'Sulawesi Selatan'],
            ['city_id' => '152', 'city_name' => 'Medan',           'province' => 'Sumatera Utara'],
            ['city_id' => '43',  'city_name' => 'Banjarmasin',     'province' => 'Kalimantan Selatan'],
            ['city_id' => '360', 'city_name' => 'Palembang',       'province' => 'Sumatera Selatan'],
            ['city_id' => '455', 'city_name' => 'Tangerang',       'province' => 'Banten'],
            ['city_id' => '114', 'city_name' => 'Bekasi',          'province' => 'Jawa Barat'],
            ['city_id' => '96',  'city_name' => 'Denpasar',        'province' => 'Bali'],
            ['city_id' => '179', 'city_name' => 'Yogyakarta',      'province' => 'DI Yogyakarta'],
        ];
    }
}
