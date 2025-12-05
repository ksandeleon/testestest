<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Activitylog\Models\Activity;

class CleanActivityLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activitylog:clean {--days= : Number of days to retain (default from config)} {--force : Force deletion without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete activity log records older than the specified retention period';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days') ?? config('activitylog.delete_records_older_than_days', 365);
        $force = $this->option('force');

        $cutoffDate = now()->subDays($days);

        // Count records to be deleted
        $count = Activity::where('created_at', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info('No activity log records found older than ' . $days . ' days.');
            return 0;
        }

        $this->info("Found {$count} activity log records older than {$days} days (before {$cutoffDate->toDateString()}).");

        // Confirm deletion unless force flag is set
        if (!$force && !$this->confirm('Do you want to delete these records?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $this->info('Deleting old activity log records...');

        $deleted = Activity::where('created_at', '<', $cutoffDate)->delete();

        $this->info("Successfully deleted {$deleted} activity log records.");

        return 0;
    }
}
