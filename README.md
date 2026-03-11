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
