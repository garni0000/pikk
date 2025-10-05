@echo off
echo Starting PicknMat development server...
echo.
echo If you see any errors, make sure you have:
echo 1. Created a .env file with your database URL and Firebase config
echo 2. Run: npm run db:push (to create database tables)
echo.
echo Starting server...
npx tsx server/index.ts
pause
