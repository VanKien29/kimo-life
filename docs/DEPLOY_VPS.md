# Deploy Kimo Life lên VPS

## Lần đầu trên VPS

```bash
git clone <URL_REPO_GIT> kimo-life
cd kimo-life

cp .env.example .env
composer install --no-dev --optimize-autoloader
php artisan key:generate

php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Sau đó điền `.env` production với `APP_URL`, `APP_ENV=production`, `APP_DEBUG=false`, thông tin MySQL, session/cache/queue và storage. Không commit `.env` lên Git.

Web server phải trỏ document root vào thư mục `public`, không trỏ vào thư mục gốc project. Bật HTTPS trước khi dùng camera.

## Mỗi lần cập nhật code

Build frontend trên máy local trước:

```bash
npm ci
npm run build
git add resources package.json package-lock.json public/build
git commit -m "build: update production frontend"
git push origin main
```

Sau đó trên VPS:

```bash
cd /duong-dan/kimo-life
git pull --ff-only origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Không chạy `npm ci` hoặc `npm run build` trên VPS nếu `public/build` đã được build và commit từ máy local.

## Quyền thư mục

Tên user/group PHP-FPM tùy VPS. Ví dụ thường gặp:

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R ug+rwx storage bootstrap/cache
```

Không xóa `storage/app/public`; đây là nơi chứa ảnh người dùng và phải được giữ lại khi pull code.

## Tiến trình nền

Nếu dùng queue hoặc scheduler, chạy bằng Supervisor/systemd thay vì giữ terminal SSH:

```bash
php artisan queue:work --tries=1
php artisan schedule:work
```

Chỉ chạy Reverb khi tính năng realtime được bật và đã cấu hình reverse proxy HTTPS.
