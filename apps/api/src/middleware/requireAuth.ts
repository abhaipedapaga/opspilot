import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../auth";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    (req as any).userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}