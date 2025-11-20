<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            [
                'name' => 'MIS Office',
                'code' => 'MIS',
                'building' => 'Main Building',
                'floor' => '2nd Floor',
                'room' => '201',
                'description' => 'Management Information Systems Office',
            ],
            [
                'name' => 'Admin Office',
                'code' => 'ADMIN',
                'building' => 'Administration Building',
                'floor' => '1st Floor',
                'room' => '101',
                'description' => 'Administrative Office',
            ],
            [
                'name' => 'Library',
                'code' => 'LIB',
                'building' => 'Library Building',
                'floor' => null,
                'room' => null,
                'description' => 'Main Library',
            ],
            [
                'name' => 'Computer Laboratory 1',
                'code' => 'COMPLAB1',
                'building' => 'Engineering Building',
                'floor' => '3rd Floor',
                'room' => '301',
                'description' => 'Computer Laboratory for Engineering Students',
            ],
            [
                'name' => 'Computer Laboratory 2',
                'code' => 'COMPLAB2',
                'building' => 'Engineering Building',
                'floor' => '3rd Floor',
                'room' => '302',
                'description' => 'Computer Laboratory for IT Students',
            ],
            [
                'name' => 'Registrar Office',
                'code' => 'REG',
                'building' => 'Administration Building',
                'floor' => '1st Floor',
                'room' => '105',
                'description' => 'Office of the Registrar',
            ],
            [
                'name' => 'Accounting Office',
                'code' => 'ACCT',
                'building' => 'Administration Building',
                'floor' => '2nd Floor',
                'room' => '201',
                'description' => 'Accounting Office',
            ],
            [
                'name' => 'Faculty Room - Engineering',
                'code' => 'FAC-ENG',
                'building' => 'Engineering Building',
                'floor' => '1st Floor',
                'room' => '110',
                'description' => 'Faculty Room for Engineering Department',
            ],
            [
                'name' => 'Stockroom',
                'code' => 'STOCK',
                'building' => 'Warehouse',
                'floor' => null,
                'room' => null,
                'description' => 'General Storage and Stockroom',
            ],
            [
                'name' => 'President\'s Office',
                'code' => 'PRES',
                'building' => 'Administration Building',
                'floor' => '3rd Floor',
                'room' => '301',
                'description' => 'Office of the University President',
            ],
        ];

        foreach ($locations as $location) {
            Location::create($location);
        }
    }
}
