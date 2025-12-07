@echo off
echo ========================================
echo   تنظيف Cache وإعادة بناء المشروع
echo ========================================
echo.

echo [1/5] حذف Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✓ تم حذف Vite cache
) else (
    echo - لا يوجد Vite cache
)
echo.

echo [2/5] حذف dist...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ تم حذف dist
) else (
    echo - لا يوجد dist folder
)
echo.

echo [3/5] التحقق من node_modules...
if not exist "node_modules" (
    echo ! node_modules غير موجود، جاري التثبيت...
    call pnpm install
)
echo ✓ node_modules موجود
echo.

echo [4/5] بناء TypeScript types...
echo جاري التحقق من الأخطاء...
call pnpm exec tsc --noEmit --skipLibCheck
echo.

echo [5/5] تشغيل dev server...
echo ========================================
echo   المتصفح على: http://localhost:8080
echo ========================================
echo.

call pnpm dev

pause
