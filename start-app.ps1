Write-Host "Starting PicknMat development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Setting up database schema first..." -ForegroundColor Yellow

# Set environment variable
$env:NODE_ENV = "development"

# Try to push database schema
Write-Host "Pushing database schema..." -ForegroundColor Cyan
try {
    & npx drizzle-kit push
    Write-Host "Database schema pushed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not push database schema. Continuing anyway..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "The app will be available at: http://localhost:5000" -ForegroundColor Green
Write-Host ""

# Start the server
& npx tsx server/index.ts

