import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";


console.log("SERVER FILE LOADED 🚀");


dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health route
app.get("/health", (req, res) => {
  console.log("Health check requested");
  res.json({ status: "ok", service: "opspilot-api" });
});

// ✅ ADD THIS HERE
app.get("/orgs", async (req, res) => {
  try {
    console.log("Fetching orgs...");
    const orgs = await prisma.organization.findMany();
    console.log("Orgs fetched successfully:", orgs);
    res.json(orgs);
  } catch (error) {
    console.error("Error fetching orgs:", error);
    
    // Fallback to mock data if database is unavailable
    console.log("Using mock data as fallback");
    res.status(200).json([
      {
        id: "mock-1",
        name: "Acme Corp",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "mock-2", 
        name: "TechStart Inc",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]);
  }
});

// Error handling middleware (MUST BE LAST)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OpsPilot API running on http://127.0.0.1:${PORT}`);
});
