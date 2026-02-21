import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { Role } from "@prisma/client";

export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      const orgId = req.params.orgId || req.body.orgId;

      if (!orgId) {
        return res.status(400).json({ error: "orgId is required" });
      }

      const membership = await prisma.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this organization" });
      }

      if (!roles.includes(membership.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      (req as any).userRole = membership.role;
      return next();
    } catch (error: any) {
      console.error("ROLE CHECK ERROR:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}