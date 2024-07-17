import { Router } from "express";
import { graphSchema } from "../validations/schemas";
import { SessionManager } from "../sessionManager";
import { PrismaClient } from "@prisma/client";

const router = Router();
const sessionManager = SessionManager.getInstance();
const db = new PrismaClient();

// const ENDPOINT = process.env.PIPELINE_URL ?? "http://localhost:5000";

router.post("/", async (req, res, next) => {
  let receivedData = req.body;
  receivedData = {
    ...receivedData,
    data: JSON.stringify(req.body.data),
  };
  let requestBody;
  console.log("req.body = ", req.body);
  try {
    requestBody = graphSchema.parse(receivedData);
    console.log("Request body parsed successfully:", requestBody);
  } catch (error) {
    return res.status(400).json({ error: "Invalid request body format" });
  }

  console.log("requestBody = ", requestBody);
  try {
    const newChart = await db.charts.create({
      data: { ...requestBody },
    });
    console.log("newChart = ", newChart);
  } catch (err) {
    console.log("error storing to db");
    return res.status(400).json({ error: "db error" });
  }

  res.status(200).json({ message: "it ran successfully" });
});

router.get("/:userId", async (req, res, next) => {
  const { userId } = req.params;
  console.log("userId = ", userId);
  try {
    const charts = await db.charts.findMany({
      where: {
        userId,
      },
    });
    res.status(200).json({ data: charts });
  } catch (err) {
    console.error("Error creating chart:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

export default router;
