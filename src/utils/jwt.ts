import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  role: "admin" | "ngo" | "restaurant";
}

export function generateToken(payload: JwtPayload) {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as JwtPayload;
}