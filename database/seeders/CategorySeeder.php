<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Desktop Computers',
                'code' => 'DESK',
                'description' => 'Desktop computers and workstations',
            ],
            [
                'name' => 'Laptop Computers',
                'code' => 'LAPT',
                'description' => 'Portable laptop computers',
            ],
            [
                'name' => 'Printers',
                'code' => 'PRIN',
                'description' => 'Printing devices',
            ],
            [
                'name' => 'Office Equipment',
                'code' => 'OFFC',
                'description' => 'General office equipment',
            ],
            [
                'name' => 'Furniture',
                'code' => 'FURN',
                'description' => 'Office and classroom furniture',
            ],
            [
                'name' => 'Air Conditioning',
                'code' => 'AIRCON',
                'description' => 'Air conditioning units',
            ],
            [
                'name' => 'Laboratory Equipment',
                'code' => 'LABE',
                'description' => 'Scientific and technical laboratory equipment',
            ],
            [
                'name' => 'Network Equipment',
                'code' => 'NETW',
                'description' => 'Routers, switches, and network devices',
            ],
            [
                'name' => 'Audio Visual Equipment',
                'code' => 'AVEQUIP',
                'description' => 'Projectors, speakers, and AV equipment',
            ],
            [
                'name' => 'Vehicles',
                'code' => 'VEHC',
                'description' => 'Institutional vehicles',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
