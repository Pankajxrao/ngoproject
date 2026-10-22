import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: "admin" | "ngo" | "restaurant";
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing. Configure it in your environment variables."
    );
  }

  return secret;
}

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
