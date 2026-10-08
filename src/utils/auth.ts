import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);

    return decoded;
  } catch {
    return null;
  }
}