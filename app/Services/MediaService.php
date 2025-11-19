<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class MediaService
{
    protected ImageManager $imageManager;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
    }

    /**
     * Process uploaded media file
     */
    public function processUpload(UploadedFile $file, ?bool $makeSvgColorable = false): array
    {
        $mimeType = $file->getMimeType();
        $originalFilename = $file->getClientOriginalName();
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $result = [
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'mime_type' => $mimeType,
            'size' => $file->getSize(),
            'disk' => 'public',
            'metadata' => [],
        ];

        // Handle SVG
        if ($mimeType === 'image/svg+xml') {
            return $this->processSvg($file, $filename, $originalFilename, $makeSvgColorable);
        }

        // Handle images
        if (str_starts_with($mimeType, 'image/')) {
            return $this->processImage($file, $filename, $originalFilename);
        }

        // Handle videos
        if (str_starts_with($mimeType, 'video/')) {
            return $this->processVideo($file, $filename, $originalFilename);
        }

        // Default: just upload the file
        $path = $file->storeAs('uploads', $filename, 'public');
        $result['path'] = $path;

        return $result;
    }

    /**
     * Process SVG file
     */
    protected function processSvg(UploadedFile $file, string $filename, string $originalFilename, bool $makeColorable): array
    {
        $content = file_get_contents($file->getRealPath());

        // Make SVG colorable
        if ($makeColorable) {
            $content = $this->makeSvgColorable($content);
        }

        // Store SVG
        $path = 'uploads/' . $filename;
        Storage::disk('public')->put($path, $content);

        return [
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'path' => $path,
            'disk' => 'public',
            'mime_type' => 'image/svg+xml',
            'size' => strlen($content),
            'is_svg_colorable' => $makeColorable,
            'metadata' => [],
        ];
    }

    /**
     * Process image file
     */
    protected function processImage(UploadedFile $file, string $filename, string $originalFilename): array
    {
        // Load image
        $image = $this->imageManager->read($file->getRealPath());

        // Get original dimensions
        $width = $image->width();
        $height = $image->height();

        // Auto-rotate based on EXIF
        if (method_exists($image, 'orientate')) {
            $image->orientate();
        }

        $result = [
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'disk' => 'public',
            'metadata' => [],
        ];

        // Resize if too large (max 2000px width)
        if ($width > 2000) {
            $image->scale(width: 2000);
        }

        // Save original
        $extension = $file->getClientOriginalExtension();
        $path = 'uploads/' . $filename;
        Storage::disk('public')->put($path, $image->encode($extension)->toString());
        $result['path'] = $path;

        // Generate WebP version
        $webpFilename = Str::uuid() . '.webp';
        $webpPath = 'uploads/' . $webpFilename;
        Storage::disk('public')->put($webpPath, $image->toWebp(80)->toString());
        $result['webp_path'] = $webpPath;

        // Generate thumbnails
        $result['thumbnail_path'] = $this->generateThumbnail($image, 150);
        $result['medium_path'] = $this->generateThumbnail($image, 600);

        return $result;
    }

    /**
     * Process video file
     */
    protected function processVideo(UploadedFile $file, string $filename, string $originalFilename): array
    {
        // Store video
        $path = $file->storeAs('uploads', $filename, 'public');

        $result = [
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'metadata' => [],
        ];

        // TODO: Extract video thumbnail with FFmpeg
        // For now, just return basic info

        return $result;
    }

    /**
     * Generate thumbnail at specified width
     */
    protected function generateThumbnail($image, int $width): string
    {
        $thumbnailImage = clone $image;
        $thumbnailImage->scale(width: $width);

        $thumbnailFilename = Str::uuid() . '.webp';
        $thumbnailPath = 'uploads/thumbs/' . $thumbnailFilename;

        Storage::disk('public')->put($thumbnailPath, $thumbnailImage->toWebp(80)->toString());

        return $thumbnailPath;
    }

    /**
     * Make SVG colorable by replacing fill and stroke with currentColor
     */
    protected function makeSvgColorable(string $svgContent): string
    {
        // Remove existing fill attributes (except fill="none")
        $svgContent = preg_replace('/fill="(?!none)[^"]*"/', 'fill="currentColor"', $svgContent);
        $svgContent = preg_replace('/fill:(?!none)[^;]*;/', 'fill:currentColor;', $svgContent);

        // Replace stroke colors (except stroke="none")
        $svgContent = preg_replace('/stroke="(?!none)[^"]*"/', 'stroke="currentColor"', $svgContent);
        $svgContent = preg_replace('/stroke:(?!none)[^;]*;/', 'stroke:currentColor;', $svgContent);

        // Remove inline styles that might override
        $svgContent = preg_replace('/style="[^"]*"/', '', $svgContent);

        return $svgContent;
    }

    /**
     * Delete all associated media files
     */
    public function deleteMediaFiles(string $path, ?string $webpPath, ?string $thumbnailPath, ?string $mediumPath, string $disk = 'public'): void
    {
        Storage::disk($disk)->delete($path);

        if ($webpPath) {
            Storage::disk($disk)->delete($webpPath);
        }
        if ($thumbnailPath) {
            Storage::disk($disk)->delete($thumbnailPath);
        }
        if ($mediumPath) {
            Storage::disk($disk)->delete($mediumPath);
        }
    }
}
