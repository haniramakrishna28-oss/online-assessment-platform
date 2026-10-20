@echo off
echo ====================================================
echo Starting Online Examination and Assessment Platform
echo ====================================================

call start_postgres.bat

echo Starting Django REST Backend on http://localhost:8000 ...
start "Django Backend" cmd /k "cd /d "%~dp0backend" && "C:\Users\Admin\anaconda3\python.exe" manage.py runserver 0.0.0.0:8000"

echo Starting React Vite Frontend on http://localhost:5173 ...
start "React Frontend" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo All services are running!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000/api/status/
echo Django Admin: http://localhost:8000/admin/
