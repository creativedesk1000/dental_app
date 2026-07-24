import { encode } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { Role, ClinicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";
import { generateSessionTokenId } from "@/lib/session-token";

const SESSION_MAX_AGE_DEFAULT = 24 * 60 * 60;
const SESSION_MAX_AGE_REMEMBER = 30 * 24 * 60 * 60;

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, Accept, X-Requested-With",
    },
  });
}

export async function GET() {
  return apiError("Method not allowed", 405);
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`login:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      return apiError("Too many login attempts. Please try again later.", 429);
    }

    const body = await req.json();
    const input = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { clinic: true },
    });

    const origin = req.headers.get("origin");
    const withCors = (res: Response) => {
      if (origin) {
        res.headers.set("Access-Control-Allow-Origin", origin);
        res.headers.set("Access-Control-Allow-Credentials", "true");
      }
      return res;
    };

    if (!user || !user.password) {
      return withCors(apiError("Invalid email or password", 401));
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      return withCors(apiError("Invalid email or password", 401));
    }

    if (user.role !== Role.SUPER_ADMIN && user.clinic) {
      if (user.clinic.status === ClinicStatus.SUSPENDED) {
        return withCors(apiError("Your clinic has been suspended. Contact support.", 403));
      }
      if (user.clinic.status === ClinicStatus.INACTIVE) {
        return withCors(apiError("Your clinic is inactive. Contact support.", 403));
      }
    }

    const sessionTokenId = generateSessionTokenId();
    const maxAge = input.rememberMe
      ? SESSION_MAX_AGE_REMEMBER
      : SESSION_MAX_AGE_DEFAULT;
    const expiresAt = new Date(Date.now() + maxAge * 1000);

    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = ip || undefined;

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

    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";
    const secret =
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "secret";

    const jwtToken = await encode({
      token: {
        id: user.id,
        role: user.role,
        clinicId: user.clinicId,
        sessionVersion: user.sessionVersion,
        sessionTokenId,
        rememberMe: input.rememberMe,
      },
      secret,
      salt: cookieName,
      maxAge,
    });

    const response = apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
      },
      sessionTokenId,
    });

    response.cookies.set(cookieName, jwtToken, {
      httpOnly: true,
      sameSite: "none",
      path: "/",
      maxAge,
      secure: true,
    });

    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
  } catch (error) {
    const errResp = handleApiError(error);
    const origin = req.headers.get("origin");
    if (origin) {
      errResp.headers.set("Access-Control-Allow-Origin", origin);
      errResp.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return errResp;
  }
}

