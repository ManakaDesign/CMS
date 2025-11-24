<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable(); // header, footer, mobile, etc.
            $table->text('description')->nullable();

            // Design Settings (JSON)
            $table->json('design_settings')->nullable();
            // {
            //   "layout_type": "horizontal_standard" | "centered" | "split" | "vertical_sidebar" | "fullscreen_overlay",
            //   "submenu_style": "dropdown_flyout" | "mega_menu" | "fullscreen_overlay" | "sidebar_flyout",
            //   "mobile_view": "burger_sidebar" | "burger_fullscreen" | "bottom_navigation" | "desktop_keep",
            //   "colors": {
            //     "background": "#ffffff",
            //     "link_color": "#4a5568",
            //     "link_hover": "#3182ce",
            //     "active_text": "#3182ce",
            //     "active_background": "#ebf8ff"
            //   },
            //   "logo": {
            //     "media_id": 123,
            //     "width": "150px",
            //     "height": "auto"
            //   },
            //   "features": {
            //     "sticky_header": true,
            //     "transparent_on_top": false,
            //     "search_bar": true,
            //     "cta_button": true,
            //     "social_icons": false
            //   },
            //   "submenu_config": {
            //     "animation": "fade" | "slide" | "none",
            //     "delay": 200,
            //     "width": "auto" | "200px",
            //     "position": "left" | "center" | "right"
            //   }
            // }

            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
