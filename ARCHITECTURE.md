# CMS Architecture Documentation

## Project Overview
Modern Content Management System with Visual Page Builder (Divi-style) and Static Site Generation, built with Laravel 10 + React 18.

## Technology Stack

### Backend
- **Framework**: Laravel 12 (PHP 8.4)
- **Database**: MySQL 8.0 / MariaDB 10.6+
- **ORM**: Eloquent
- **Caching**: Redis (optional) / File Cache
- **Authentication**: Laravel Sanctum

### Frontend
- **Builder**: React 18 (SPA)
- **Build Tool**: Vite 4
- **State Management**: Zustand / Redux Toolkit
- **Styling**: Tailwind CSS
- **Drag & Drop**: react-dnd or dnd-kit

### Static Site Generation
- **Template Engine**: Blade Templates
- **Asset Optimization**: Laravel Mix / Vite
- **Image Processing**: Intervention Image

## Directory Structure

```
cms-root/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/          # Admin panel controllers
│   │   │   ├── Api/            # API for React Builder
│   │   │   └── Installer/      # Installation wizard
│   │   └── Middleware/
│   ├── Models/                 # Eloquent models
│   │   ├── Page.php
│   │   ├── Element.php
│   │   ├── Template.php
│   │   └── Media.php
│   ├── Services/               # Business logic
│   │   ├── BuilderService.php
│   │   ├── GeneratorService.php
│   │   └── MediaService.php
│   └── Providers/
│
├── bootstrap/
│   └── cache/                  # Bootstrap cache
│
├── config/                     # Laravel config
│   ├── cms.php                 # CMS-specific config
│   └── builder.php             # Builder settings
│
├── database/
│   ├── migrations/             # Database migrations
│   └── seeders/                # Database seeders
│
├── install/                    # Installation wizard (PHP)
│   ├── index.php              # Entry point (redirects to setup)
│   ├── setup.php              # Installation wizard
│   ├── requirements.php       # System requirements check
│   ├── views/                 # Installer HTML templates
│   └── assets/                # Installer CSS/JS
│
├── public/                     # Web root
│   ├── index.php              # Laravel entry point
│   ├── admin/                 # React Builder (compiled)
│   │   ├── index.html
│   │   └── assets/
│   ├── sites/                 # Generated static sites
│   │   └── [site-id]/
│   └── uploads/               # Symlink to storage/app/uploads
│
├── resources/
│   ├── react-builder/         # React Builder source
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── tsconfig.json
│   ├── views/                 # Blade templates
│   │   ├── admin.blade.php   # React Builder wrapper
│   │   └── templates/        # Static site templates
│   └── css/
│       └── app.css
│
├── routes/
│   ├── web.php               # Web routes
│   ├── api.php               # API routes for Builder
│   └── installer.php         # Installation routes
│
├── storage/
│   ├── app/
│   │   ├── uploads/          # User uploaded files
│   │   ├── media/            # Processed media
│   │   └── generated-sites/  # Built static sites (before deploy)
│   ├── framework/
│   └── logs/
│
├── tests/
│   ├── Feature/              # Feature tests
│   └── Unit/                 # Unit tests
│
├── .env                      # Environment config
├── .env.example
├── artisan                   # Laravel CLI
├── composer.json             # PHP dependencies
├── package.json              # Node dependencies
├── README.md                 # Laravel README
├── Readme.txt                # CMS Project Concept
└── ARCHITECTURE.md           # This file
```

## Installation Flow

### 1. Detection Phase
```
User uploads ZIP → Extracts to /var/www/html/
Opens browser: https://domain.com
↓
public/index.php checks if .env exists
  NO → Redirect to /install/setup.php
  YES → Load Laravel application
```

### 2. Installation Wizard (`install/setup.php`)

**Step 1: System Requirements Check**
- PHP Version >= 8.2
- Required Extensions (PDO, mbstring, GD, etc.)
- File Permissions (storage/, bootstrap/cache/)
- MySQL/MariaDB availability

**Step 2: Database Configuration**
- Database host, name, username, password
- Test connection
- Create database if not exists
- Generate .env file

**Step 3: Database Migration**
- Run `php artisan migrate`
- Create tables: pages, elements, templates, media, users, etc.

**Step 4: Admin Account**
- Email, password
- Create first admin user
- Generate APP_KEY

**Step 5: Site Settings**
- Site name, URL
- Basic configuration

**Step 6: Complete**
- Create .installed lock file
- Redirect to /admin

### 3. Post-Installation
- Access admin panel: `/admin`
- React Builder loads as SPA
- Connect to Laravel API endpoints

## Core Models

### Page
```php
- id
- title
- slug
- content (JSON - element tree)
- template_id
- meta_title
- meta_description
- status (draft|published)
- published_at
- created_at
- updated_at
```

### Element
```php
- id
- type (section|row|column|text|image|button|etc)
- settings (JSON - all element properties)
- styles (JSON - CSS properties per breakpoint)
- parent_id
- order
- page_id
```

### Template
```php
- id
- name
- type (page|header|footer|global)
- structure (JSON)
- thumbnail
```

### Media
```php
- id
- filename
- path
- mime_type
- size
- alt_text
- user_id
- created_at
```

## API Endpoints

### Builder API (`/api/builder/...`)
```
GET    /api/builder/pages                 # List all pages
POST   /api/builder/pages                 # Create page
GET    /api/builder/pages/{id}            # Get page
PUT    /api/builder/pages/{id}            # Update page
DELETE /api/builder/pages/{id}            # Delete page

POST   /api/builder/pages/{id}/elements   # Add element
PUT    /api/builder/elements/{id}         # Update element
DELETE /api/builder/elements/{id}         # Delete element

GET    /api/builder/templates             # List templates
POST   /api/builder/templates             # Create template

GET    /api/builder/media                 # List media
POST   /api/builder/media/upload          # Upload file
DELETE /api/builder/media/{id}            # Delete media

POST   /api/builder/pages/{id}/build      # Generate static site
GET    /api/builder/pages/{id}/preview    # Preview page
```

## Static Site Generation

### Build Process
```
1. User clicks "Publish" in Builder
   ↓
2. API POST /api/builder/pages/{id}/build
   ↓
3. GeneratorService.php:
   - Load page data from database
   - Load template (header/footer/global elements)
   - Render Blade template with page content
   - Generate HTML
   - Optimize images (WebP conversion, resize)
   - Minify CSS/JS
   - Generate sitemap.xml
   ↓
4. Save to storage/app/generated-sites/{page-id}/
   ↓
5. Deploy to public/sites/{slug}/
   ↓
6. Update page.status = 'published'
   ↓
7. Return success + URL
```

### Generated Site Structure
```
public/sites/{slug}/
├── index.html              # Main page HTML
├── assets/
│   ├── css/
│   │   └── style.min.css
│   ├── js/
│   │   └── script.min.js
│   └── images/
│       ├── image1.webp
│       └── image1.jpg (fallback)
└── sitemap.xml
```

## Security

### Installation Security
- `.installed` lock file prevents re-installation
- Installer files should be deleted after installation (optional)
- Strong password requirements for admin

### Runtime Security
- CSRF protection (Laravel default)
- XSS protection (input sanitization)
- SQL injection protection (Eloquent ORM)
- Authentication via Laravel Sanctum
- File upload validation (mime type, size)
- Rate limiting on API endpoints

### File Permissions
```
storage/             → 775 (writable)
bootstrap/cache/     → 775 (writable)
public/uploads/      → 775 (writable)
.env                 → 644 (readable only by web server)
```

## Development Workflow

### Local Development Setup
```bash
# 1. Clone repository
git clone <repo-url>
cd cms

# 2. Install PHP dependencies
composer install

# 3. Install Node dependencies
cd resources/react-builder
npm install
cd ../..

# 4. Copy environment file
cp .env.example .env

# 5. Generate application key
php artisan key:generate

# 6. Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=cms_dev
DB_USERNAME=root
DB_PASSWORD=

# 7. Run migrations
php artisan migrate

# 8. Create admin user (optional seeder)
php artisan db:seed --class=AdminSeeder

# 9. Start Laravel server
php artisan serve

# 10. Start Vite dev server (separate terminal)
cd resources/react-builder
npm run dev
```

### Building for Production
```bash
# 1. Build React Builder
cd resources/react-builder
npm run build
cd ../..

# 2. Optimize Laravel
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. Create ZIP package
zip -r cms-v1.0.0.zip . -x "*.git*" "node_modules/*" "tests/*"
```

## Testing Strategy

### Backend Tests (PHPUnit)
```bash
php artisan test
```
- Feature tests for API endpoints
- Unit tests for services
- Database factory and seeders for test data

### Frontend Tests (Vitest)
```bash
cd resources/react-builder
npm run test
```
- Component tests
- Integration tests for Builder

### E2E Tests (Laravel Dusk)
```bash
php artisan dusk
```
- Installation wizard flow
- Page creation and publishing
- Builder interactions

## Performance Considerations

### Backend
- Eloquent eager loading to prevent N+1 queries
- Redis caching for frequently accessed data
- Queue jobs for heavy operations (image processing, site building)

### Frontend
- Code splitting in React Builder
- Lazy loading of components
- Optimistic UI updates

### Generated Sites
- Static HTML (fastest possible)
- WebP images with fallbacks
- Minified CSS/JS
- CDN-ready structure

## Next Steps

### Phase 1: MVP (Current)
- [x] Project setup with Laravel
- [ ] Installation wizard
- [ ] Basic database schema
- [ ] React Builder scaffold
- [ ] Core API endpoints
- [ ] Simple static site generation

### Phase 2: Core Features
- [ ] Drag & drop builder
- [ ] Element library (Section, Row, Column, Text, Image, Button)
- [ ] Responsive breakpoint switcher
- [ ] Media library
- [ ] Template system
- [ ] SEO settings

### Phase 3: Advanced Features
- [ ] CSS editor
- [ ] Navigation builder
- [ ] User roles & permissions
- [ ] Plugin system architecture
- [ ] Backup & restore

---

**Last Updated**: 2025-11-05
**Version**: 0.1.0 (Initial Setup)
