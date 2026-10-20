@echo off
echo Starting PostgreSQL 18 Local Server...
"C:\Users\Admin\anaconda3\envs\pgtest\Library\bin\pg_ctl.exe" -D "C:\Users\Admin\Desktop\online examination platform\pgdata" -l "C:\Users\Admin\Desktop\online examination platform\pgdata\server.log" start
echo PostgreSQL started on port 5432 (database: online_exam_db)
