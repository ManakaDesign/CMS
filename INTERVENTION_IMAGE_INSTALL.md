# Intervention Image Installation

## Installation Steps

1. Install Intervention Image v3 via Composer:
```bash
composer require intervention/image
```

2. The package will auto-discover in Laravel 11

3. Create thumbnails directory:
```bash
mkdir -p storage/app/public/uploads/thumbs
```

4. Run migrations:
```bash
php artisan migrate
```

5. Clear cache if needed:
```bash
php artisan config:clear
php artisan cache:clear
```

## Package Info
- Package: intervention/image
- Version: ^3.0
- Driver: GD (default, already included in PHP)

## Verification
Test that it works by uploading an image through the Media Library.
The system will automatically:
- Resize images > 2000px width
- Generate WebP version
- Create thumbnails (150px, 600px)
- For SVGs with "make colorable" option: inject currentColor

## Alternative Driver
If you want to use Imagick instead of GD:
```bash
composer require intervention/image-imagick
```

Then update MediaService to use Imagick driver instead of GD.
