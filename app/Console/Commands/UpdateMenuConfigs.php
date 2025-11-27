<?php

namespace App\Console\Commands;

use App\Models\Menu;
use Illuminate\Console\Command;

class UpdateMenuConfigs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'menus:update-configs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update existing menus with new configuration fields (CTA button and social icons)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating menu configurations...');

        $menus = Menu::all();
        $updatedCount = 0;

        foreach ($menus as $menu) {
            $settings = $menu->design_settings;
            $updated = false;

            // Add CTA button config if missing
            if (!isset($settings['cta_button_config'])) {
                $settings['cta_button_config'] = [
                    'text' => 'Get Started',
                    'action_type' => 'url',
                    'page_id' => null,
                    'url' => '#',
                    'position' => 'right_of_nav',
                    'styling' => [
                        'bg_color' => '#3b82f6',
                        'text_color' => '#ffffff',
                        'border_radius' => '6px',
                        'padding' => '10px 20px',
                        'hover_bg_color' => '#2563eb',
                        'hover_text_color' => '#ffffff',
                        'border_width' => '0px',
                        'border_color' => 'transparent',
                    ],
                ];
                $updated = true;
            }

            // Add social icons config if missing
            if (!isset($settings['social_icons_config'])) {
                $settings['social_icons_config'] = [
                    'icons' => [],
                    'position' => 'right_of_nav',
                    'styling' => [
                        'size' => '20px',
                        'color' => '#e2e8f0',
                        'hover_color' => '#3b82f6',
                        'spacing' => '12px',
                    ],
                ];
                $updated = true;
            }

            // Update submenu_config if missing
            if (!isset($settings['submenu_config'])) {
                $settings['submenu_config'] = [
                    'animation' => 'fade',
                    'delay' => 200,
                    'width' => 'auto',
                    'position' => 'left',
                ];
                $updated = true;
            }

            if ($updated) {
                $menu->design_settings = $settings;
                $menu->save();
                $updatedCount++;
                $this->line("✓ Updated menu: {$menu->name}");
            }
        }

        $this->info("Updated {$updatedCount} menu(s) successfully!");

        return Command::SUCCESS;
    }
}
