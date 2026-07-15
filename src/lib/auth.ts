import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ClinicStatus, Role } from "@prisma/client";
import { generateSessionTokenId } from "@/lib/session-token";

const SESSION_MAX_AGE_DEFAULT = 24 * 60 * 60; // 1 day
const SESSION_MAX_AGE_REMEMBER = 30 * 24 * 60 * 60; // 30 days

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      clinicId: string | null;
      sessionTokenId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    clinicId: string | null;
    rememberMe?: boolean;
    sessionTokenId?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    clinicId: string | null;
    sessionVersion: number;
    sessionTokenId: string;
    rememberMe?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const rememberMe = credentials.rememberMe === "true" || credentials.rememberMe === true;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { clinic: true },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return null;
        }

        if (user.role !== Role.SUPER_ADMIN && user.clinic) {
          if (user.clinic.status === ClinicStatus.SUSPENDED) {
            throw new Error("ClinicSuspended");
          }
          if (user.clinic.status === ClinicStatus.INACTIVE) {
            throw new Error("ClinicInactive");
          }
        }

        const sessionTokenId = generateSessionTokenId();
        const maxAge = rememberMe ? SESSION_MAX_AGE_REMEMBER : SESSION_MAX_AGE_DEFAULT;
        const expiresAt = new Date(Date.now() + maxAge * 1000);

        const userAgent = request?.headers?.get("user-agent") || undefined;
        const ipAddress =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request?.headers?.get("x-real-ip") ||
          undefined;

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }),
          prisma.userSession.create({
            data: {
              userId: user.id,
              tokenId: sessionTokenId,
              userAgent,
              ipAddress,
              expiresAt,
            },
          }),
        ]);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clinicId: user.clinicId,
          rememberMe,
          sessionTokenId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { sessionVersion: true },
        });

        token.id = user.id as string;
        token.role = user.role as Role;
        token.clinicId = user.clinicId as string | null;
        token.sessionVersion = dbUser?.sessionVersion ?? 0;
        token.sessionTokenId = user.sessionTokenId as string;
        token.rememberMe = user.rememberMe;

        const maxAge = user.rememberMe
          ? SESSION_MAX_AGE_REMEMBER
          : SESSION_MAX_AGE_DEFAULT;
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true },
        });

        if (
          dbUser &&
          token.sessionVersion !== undefined &&
          dbUser.sessionVersion !== token.sessionVersion
        ) {
          return null;
        }

        if (token.sessionTokenId) {
          const session = await prisma.userSession.findUnique({
            where: { tokenId: token.sessionTokenId as string },
          });
          if (!session || session.expiresAt < new Date()) {
            return null;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token || !session.user) {
        return session;
      }

      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.clinicId = token.clinicId as string | null;
      session.user.sessionTokenId = token.sessionTokenId as string;
      return session;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.sessionTokenId) {
        await prisma.userSession.deleteMany({
          where: { tokenId: message.token.sessionTokenId as string },
        });
      }
    },
  },
});
