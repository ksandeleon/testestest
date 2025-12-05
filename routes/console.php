<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule activity log cleanup every 6 months
Schedule::command('activitylog:clean --force')
    ->cron('0 0 1 */6 *') // At 00:00 on day 1 of every 6th month
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Illuminate\Support\Facades\Log::info('Activity logs cleaned successfully');
    })
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('Activity log cleanup failed');
    });
