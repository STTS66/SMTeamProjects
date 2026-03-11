import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import {
  getAuthBaseUrl,
  getGoogleOAuthConfig,
  shouldTrustHost
} from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { ensureGoogleUsername } from "@/lib/usernames";
import { loginSchema } from "@/lib/validations/auth";
import { normalizeUsername } from "@/lib/utils";

const authBaseUrl = getAuthBaseUrl();

if (authBaseUrl && !process.env.AUTH_URL) {
  process.env.AUTH_URL = authBaseUrl;
}

const providers: any[] = [
  Credentials({
    name: "Email or username",
    credentials: {
      identifier: {
        label: "Email or username",
        type: "text"
      },
      password: {
        label: "Password",
        type: "password"
      }
    },
    async authorize(credentials) {
      const parsedCredentials = loginSchema.safeParse(credentials);

      if (!parsedCredentials.success) {
        return null;
      }

      const identifier = parsedCredentials.data.identifier.trim();
      const identifierNormalized = normalizeUsername(identifier);

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            {
              email: identifier.toLowerCase()
            },
            {
              usernameNormalized: identifierNormalized
            }
          ]
        }
      });

      if (!user || !user.passwordHash || user.isBanned) {
        return null;
      }

      const isValidPassword = await compare(
        parsedCredentials.data.password,
        user.passwordHash
      );

      if (!isValidPassword) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.username,
        image: user.image,
        role: user.role,
        username: user.username,
        isBanned: user.isBanned
      };
    }
  })
];

const googleOAuth = getGoogleOAuthConfig();

if (googleOAuth) {
  providers.unshift(
    Google({
      clientId: googleOAuth.clientId,
      clientSecret: googleOAuth.clientSecret
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  trustHost: shouldTrustHost(),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      const databaseUser = await prisma.user.findUnique({
        where: {
          email: user.email.toLowerCase()
        }
      });

      if (databaseUser?.isBanned) {
        return false;
      }

      if (databaseUser && account?.provider === "google") {
        await ensureGoogleUsername(databaseUser.id, databaseUser.email, user.name);
      }

      if (databaseUser) {
        await prisma.user.update({
          where: {
            id: databaseUser.id
          },
          data: {
            lastSeenAt: new Date()
          }
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      const lookupId = user?.id ?? token.sub;

      if (!lookupId) {
        return token;
      }

      const databaseUser = await prisma.user.findUnique({
        where: {
          id: lookupId
        }
      });

      if (!databaseUser) {
        return token;
      }

      token.sub = databaseUser.id;
      token.email = databaseUser.email;
      token.name = databaseUser.username ?? databaseUser.email;
      token.picture = undefined;
      token.role = databaseUser.role;
      token.username = databaseUser.username;
      token.isBanned = databaseUser.isBanned;

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.sub) {
        return session;
      }

      session.user.id = token.sub;
      session.user.role = (token.role as Role | undefined) ?? Role.USER;
      session.user.username =
        (token.username as string | null | undefined) ?? session.user.name ?? null;
      session.user.isBanned = Boolean(token.isBanned);
      session.user.image = null;

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return `${baseUrl}/projects`;
    }
  }
});
