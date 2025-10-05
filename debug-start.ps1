Write-Host "=== PicknMat Debug Startup ===" -ForegroundColor Magenta
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file NOT found" -ForegroundColor Red
    Write-Host "Please create a .env file with your database URL and Firebase config" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = & node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found or not working" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Cyan
try {
    $npmVersion = & npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found or not working" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting server..." -ForegroundColor Green
Write-Host "If successful, open: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""

# Start the server
& npx tsx server/index.ts

