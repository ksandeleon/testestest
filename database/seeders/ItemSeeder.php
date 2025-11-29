<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Item;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all categories, locations, and users
        $categories = Category::all();
        $locations = Location::all();
        $users = User::all();

        if ($categories->isEmpty() || $locations->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Please seed categories, locations, and users first!');
            return;
        }

        // Sample items based on the attached image
        $items = [
            [
                'iar_number' => 'IAR # 164-2021-054',
                'property_number' => '2021-06-086-164',
                'fund_cluster' => 'FUND 164',
                'name' => 'Desktop Computer',
                'description' => 'ACER VERITON M4665G DESKTOP W/ MICROSOFT OFFICE STANDARD OLP NL ACADEMIC (DESKTOP)',
                'brand' => 'Acer',
                'model' => 'VERITON M4665G',
                'serial_number' => 'DTVSPSP01G107025E43D00',
                'specifications' => 'Desktop with Microsoft Office Standard OLP NL Academic',
                'acquisition_cost' => 78710.00,
                'unit_of_measure' => 'unit',
                'quantity' => 1,
                'category_id' => $categories->where('code', 'DESK')->first()->id,
                'location_id' => $locations->where('code', 'MIS')->first()->id,
                'accountable_person_id' => $users->first()->id,
                'accountable_person_name' => 'DR. JESUS PAGUIGAN',
                'accountable_person_position' => 'Director',
                'date_acquired' => '2021-06-04',
                'date_inventoried' => now(),
                'estimated_useful_life' => now()->addYears(5),
                'status' => 'assigned',
                'condition' => 'good',
                'created_by' => $users->first()->id,
                'remarks' => 'Initial inventory item from photo reference',
            ],
        ];

        // Create the specific item from the image
        foreach ($items as $item) {
            Item::updateOrCreate(
                ['iar_number' => $item['iar_number']],
                $item
            );
        }

        $this->command->info('Created/Updated 1 item from reference image.');

        // Generate additional random items for testing
        $itemCount = 49; // Total 50 items including the one above

        for ($i = 0; $i < $itemCount; $i++) {
            $category = $categories->random();
            $location = $locations->random();
            $accountablePerson = $users->random();

            // Item types based on category
            $itemsByCategory = [
                'DESK' => ['Desktop Computer', 'Workstation', 'All-in-One PC'],
                'LAPT' => ['Laptop Computer', 'Notebook', 'Ultrabook'],
                'PRIN' => ['Laser Printer', 'Inkjet Printer', 'Multifunction Printer', 'Scanner'],
                'OFFC' => ['Desk', 'Chair', 'Cabinet', 'Whiteboard', 'Calculator'],
                'FURN' => ['Office Table', 'Office Chair', 'Filing Cabinet', 'Bookshelf'],
                'AIRCON' => ['Split Type Aircon', 'Window Type Aircon', 'Ceiling Cassette Aircon'],
                'LABE' => ['Microscope', 'Oscilloscope', 'Power Supply', 'Multimeter'],
                'NETW' => ['Router', 'Switch', 'Access Point', 'Network Cable Tester'],
                'AVEQUIP' => ['Projector', 'Smart TV', 'Sound System', 'Microphone'],
                'VEHC' => ['Service Vehicle', 'Van', 'Truck'],
            ];

            $brands = [
                'DESK' => ['Acer', 'Dell', 'HP', 'Lenovo', 'Asus'],
                'LAPT' => ['Acer', 'Dell', 'HP', 'Lenovo', 'Asus', 'Apple', 'MSI'],
                'PRIN' => ['Canon', 'Epson', 'HP', 'Brother', 'Xerox'],
                'OFFC' => ['Steelcase', 'Herman Miller', 'Ikea', 'Office Warehouse'],
                'FURN' => ['Steelcase', 'Herman Miller', 'Ikea', 'Office Warehouse'],
                'AIRCON' => ['Carrier', 'Daikin', 'LG', 'Samsung', 'Panasonic'],
                'LABE' => ['Fluke', 'Tektronix', 'Keysight', 'Rigol'],
                'NETW' => ['Cisco', 'Ubiquiti', 'TP-Link', 'D-Link', 'Netgear'],
                'AVEQUIP' => ['Epson', 'Sony', 'BenQ', 'Samsung', 'LG'],
                'VEHC' => ['Toyota', 'Mitsubishi', 'Isuzu', 'Ford'],
            ];

            $categoryCode = $category->code;
            $itemNames = $itemsByCategory[$categoryCode] ?? ['Equipment'];
            $itemBrands = $brands[$categoryCode] ?? ['Generic'];

            $itemName = $itemNames[array_rand($itemNames)];
            $itemBrand = $itemBrands[array_rand($itemBrands)];

            $year = rand(2018, 2024);
            $month = str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT);
            $seq = str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
            $fund = rand(100, 999);

            Item::create([
                'iar_number' => sprintf('IAR # %d-%d-%s', $fund, $year, $seq),
                'property_number' => sprintf('%d-%s-%s-%d', $year, $month, $seq, $fund),
                'fund_cluster' => sprintf('FUND %d', $fund),
                'name' => $itemName,
                'description' => sprintf('%s %s %s', $itemBrand, strtoupper(fake()->bothify('??###?')), $itemName),
                'brand' => $itemBrand,
                'model' => strtoupper(fake()->bothify('??###?')),
                'serial_number' => strtoupper(fake()->bothify('??###??###??###??')),
                'specifications' => fake()->sentence(8),
                'acquisition_cost' => fake()->randomFloat(2, 5000, 150000),
                'unit_of_measure' => 'unit',
                'quantity' => 1,
                'category_id' => $category->id,
                'location_id' => $location->id,
                'accountable_person_id' => $accountablePerson->id,
                'accountable_person_name' => $accountablePerson->name,
                'accountable_person_position' => fake()->randomElement(['Director', 'Manager', 'Supervisor', 'Head', 'Dean', 'Professor']),
                'date_acquired' => fake()->dateTimeBetween('-5 years', 'now'),
                'date_inventoried' => fake()->dateTimeBetween('-1 year', 'now'),
                'estimated_useful_life' => fake()->dateTimeBetween('now', '+10 years'),
                'status' => fake()->randomElement(['available', 'assigned', 'in_use', 'in_maintenance']),
                'condition' => fake()->randomElement(['excellent', 'good', 'fair']),
                'created_by' => $users->first()->id,
                'remarks' => fake()->optional(0.3)->sentence(),
            ]);
        }

        $this->command->info("Created {$itemCount} additional random items.");
        $this->command->info('Total items created: ' . ($itemCount + 1));
    }
}

