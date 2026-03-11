import type { DefaultSession } from "next-auth";

type AppRole = "USER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role?: AppRole;
      username?: string | null;
      isBanned?: boolean;
    };
  }

  interface User {
    role?: AppRole;
    username?: string | null;
    isBanned?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
    username?: string | null;
    isBanned?: boolean;
  }
}

