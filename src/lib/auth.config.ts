import type { NextAuthConfig } from "next-auth";

const SESSION_MAX_AGE_DEFAULT = 24 * 60 * 60;
const SESSION_MAX_AGE_REMEMBER = 30 * 24 * 60 * 60;

export const APP_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CLINIC_ADMIN: "CLINIC_ADMIN",
  RECEPTIONIST: "RECEPTIONIST",
  DOCTOR: "DOCTOR",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_REMEMBER,
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as AppRole;
        token.clinicId = user.clinicId as string | null;
        token.sessionTokenId = user.sessionTokenId as string;
        token.rememberMe = user.rememberMe;

        const maxAge = user.rememberMe
          ? SESSION_MAX_AGE_REMEMBER
          : SESSION_MAX_AGE_DEFAULT;
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token || !session.user) {
        return session;
      }

      session.user.id = token.id as string;
      session.user.role = token.role as AppRole;
      session.user.clinicId = token.clinicId as string | null;
      session.user.sessionTokenId = token.sessionTokenId as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
