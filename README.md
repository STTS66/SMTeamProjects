# SMTeam Platform

Стартовый full-stack каркас для сайта команды SMTeam: проекты, роли USER/ADMIN, credentials auth, Google OAuth, Prisma и PostgreSQL.

## Выбранный стек

- Next.js App Router + TypeScript
- Auth.js (`next-auth`) + Credentials + Google OAuth
- Prisma ORM + PostgreSQL
- Supabase Storage для файлов проектов
- Data URL storage для аватарок на этапе MVP
- OTP-архитектура заложена в БД, но пока отключена

## Что уже есть

- Регистрация и вход по email/логину + паролю
- Google OAuth готов к включению через env
- Редирект после входа в `/projects`
- Лента проектов с публикацией для администратора
- Профиль с редактированием никнейма и аватарки
- Админ-панель с просмотром пользователей, баном и базовой статистикой
- Seed для единственного администратора `admin_smteam`

## Запуск

1. Скопируйте .env.example в .env.
2. Укажите DATABASE_URL и AUTH_SECRET.
3. При необходимости добавьте GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET.
4. Для загрузки файлов проектов добавьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.
5. При необходимости задайте SUPABASE_STORAGE_BUCKET, по умолчанию используется `smteam-files`.
6. В PowerShell используйте npm.cmd install.
7. Выполните npm.cmd run prisma:generate.
8. Выполните npm.cmd run prisma:migrate -- --name init.
9. Выполните npm.cmd run prisma:seed.
10. Запустите проект через npm.cmd run dev.

## Google OAuth

Чтобы включить вход через Google, создайте OAuth Client ID в Google Cloud Console.
Используйте callback URL для локальной разработки:
- http://localhost:3000/api/auth/callback/google
После этого вставьте реальные значения в .env:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
Кнопка входа через Google появляется автоматически только когда в env стоят реальные значения, а не плейсхолдеры.

## Render Deploy
- `render.yaml` уже добавлен в репозиторий.
- Set DATABASE_URL and AUTH_SECRET on Render.
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Render.
- `SUPABASE_STORAGE_BUCKET` defaults to `smteam-files`.
- To reseed admin on Render, set ADMIN_SEED_PASSWORD and run npm run prisma:seed.
- The service runs prisma migrate deploy before next start.
- Set AUTH_URL only if you use a custom domain.

## Supabase Storage

Файлы проектов больше не должны храниться на локальном диске Render, потому что такой диск очищается после redeploy или перезапуска.

Что нужно подготовить в Supabase:
- Откройте Storage в панели проекта Supabase.
- Разрешите приложению использовать service role key.
- Можно не создавать бакет вручную: приложение попробует создать public bucket `smteam-files` на первой загрузке файла.

Что нужно указать в env:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET` при желании, если нужен свой bucket name
