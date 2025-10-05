@echo off
echo Setting up database schema...
echo.
echo This will create the necessary tables in your Neon database.
echo Make sure your DATABASE_URL in .env is correct.
echo.
npx drizzle-kit push
echo.
echo Database setup complete!
pause
