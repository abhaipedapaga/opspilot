import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { signAccessToken } from "./auth";
import { requireAuth } from "./middleware/requireAuth";

console.log("SERVER FILE LOADED 🚀");
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);
console.log("DATABASE_URL loaded:", !!process.env.DATABASE_URL);

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "opspilot-api" });
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const accessToken = signAccessToken({ userId: user.id });
    return res.json({ accessToken, user: { id: user.id, email: user.email, fullName: user.fullName } });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: "Internal server error", details: String(error?.message || error) });
  }
});

app.get("/me", requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, fullName: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (error: any) {
    console.error("ME ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/me/role", requireAuth, async (req: any, res) => {
  try {
    const orgId = req.query.orgId as string;
    if (!orgId) return res.status(400).json({ error: "orgId is required" });
    const membership = await prisma.membership.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: req.userId } },
    });
    if (!membership) return res.json({ role: null });
    return res.json({ role: membership.role });
  } catch (error: any) {
    console.error("ME ROLE ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/orgs", requireAuth, async (_req, res) => {
  try {
    const orgs = await prisma.organization.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(orgs);
  } catch (error: any) {
    console.error("ORGS ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/orgs", requireAuth, async (req, res) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name) return res.status(400).json({ error: "Name is required" });
    const org = await prisma.organization.create({ data: { name } });
    return res.json(org);
  } catch (error: any) {
    console.error("CREATE ORG ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/orgs/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { name } = req.body as { name?: string };
    if (!name) return res.status(400).json({ error: "Name is required" });
    const org = await prisma.organization.update({ where: { id }, data: { name } });
    return res.json(org);
  } catch (error: any) {
    console.error("UPDATE ORG ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/orgs/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    await prisma.organization.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("DELETE ORG ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Members ──────────────────────────────────────────────────
app.get("/orgs/:orgId/members", requireAuth, async (req, res) => {
  try {
    const orgId = req.params.orgId as string;
    const members = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, email: true, fullName: true } } },
      orderBy: { createdAt: "asc" },
    });
    return res.json(members);
  } catch (error: any) {
    console.error("GET MEMBERS ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/orgs/:orgId/members", requireAuth, async (req, res) => {
  try {
    const orgId = req.params.orgId as string;
    const { email, role } = req.body as { email?: string; role?: string };
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const membership = await prisma.membership.create({
      data: { organizationId: orgId, userId: user.id, role: (role as any) || "VIEWER" },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
    return res.json(membership);
  } catch (error: any) {
    if (error.code === "P2002") return res.status(409).json({ error: "User is already a member" });
    console.error("ADD MEMBER ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/orgs/:orgId/members/:userId", requireAuth, async (req, res) => {
  try {
    const orgId = req.params.orgId as string;
    const userId = req.params.userId as string;
    const { role } = req.body as { role?: string };
    if (!role) return res.status(400).json({ error: "Role is required" });
    const membership = await prisma.membership.update({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      data: { role: role as any },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
    return res.json(membership);
  } catch (error: any) {
    console.error("UPDATE MEMBER ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/orgs/:orgId/members/:userId", requireAuth, async (req, res) => {
  try {
    const orgId = req.params.orgId as string;
    const userId = req.params.userId as string;
    await prisma.membership.delete({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    return res.json({ success: true });
  } catch (error: any) {
    console.error("DELETE MEMBER ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// GET /stats
app.get("/stats", requireAuth, async (_req, res) => {
  try {
    const [totalOrgs, totalUsers, totalMembers] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.membership.count(),
    ]);

    const recentOrgs = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    });

    const membersByOrg = await prisma.membership.groupBy({
      by: ["organizationId"],
      _count: { userId: true },
    });

    return res.json({ totalOrgs, totalUsers, totalMembers, recentOrgs, membersByOrg });
  } catch (error: any) {
    console.error("STATS ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({ error: "Internal server error", details: String(err?.message || err) });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});