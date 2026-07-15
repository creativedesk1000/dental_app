import { signOut } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    await signOut({ redirect: false });
    return apiSuccess({ message: "Logged out successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
