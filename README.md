# SMTeam Platform

Стартовый full-stack каркас для сайта команды SMTeam: проекты, роли USER/ADMIN, credentials auth, Google OAuth, Prisma и PostgreSQL.

## Выбранный стек

- Next.js App Router + TypeScript
- Auth.js (`next-auth`) + Credentials + Google OAuth
- Prisma ORM + PostgreSQL
- Local file storage для аватарок и вложений на этапе MVP
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
4. В PowerShell используйте npm.cmd install.
5. Выполните npm.cmd run prisma:generate.
6. Выполните npm.cmd run prisma:migrate -- --name init.
7. Выполните npm.cmd run prisma:seed.
8. Запустите проект через npm.cmd run dev.

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
- To reseed admin on Render, set ADMIN_SEED_PASSWORD and run npm run prisma:seed.
- The service runs prisma migrate deploy before next start.
- Set AUTH_URL only if you use a custom domain.
