import { Router } from "express";
import { triggerPipelineSchema } from "../validations/schemas";
import { SessionManager } from "../sessionManager";
import axios from "axios";

const router = Router();
const sessionManager = SessionManager.getInstance();

const ENDPOINT = process.env.PIPELINE_URL ?? "http://localhost:5000";

router.get("/trigger", async (req, res, next) => {
  let data = req.body;
  data = {
    ...data,
    projectConfig: JSON.stringify(req.body.projectConfig),
  };
  let requestBody;
  console.log("req.body = ", req.body);
  try {
    requestBody = triggerPipelineSchema.parse(data);
    console.log("Request body parsed successfully:", requestBody);
  } catch (error) {
    return res.status(400).json({ error: "Invalid request body format" });
  }

  console.log("requestBody = ", requestBody);
  const { projectConfig } = requestBody;
  console.log("projectConfig = ", projectConfig);
  try {
    await axios.post(`${ENDPOINT}/trigger-pipeline`, {
      project_config: projectConfig,
      message: {
        sessionId: "clymjpbjk016bhy06kla6ivql",
        nextState: "None",
        selectedComponent: "InsightModelRefinement",
        userMessage: "",
        agentResponseMessage: "1",
        insightModelStatus: "None",
        refinedQueries:
          '{"arr":["What are the current challenges in identifying and validating biomarkers for combination therapies?","How do Key Opinion Leaders in the field of oncology perceive the role of biomarkers in predicting treatment outcomes for combination therapies?"]}',
        insightModel:
          '{"enrichments":{"classification_labels":["Key_Opinion_Leaders","biomarker_development","treatment"]}}',
        type: "ANSWER",
        data: "",
        context: "",
        suggestedLabels:
          '{"enrichments":["biomarker_validation","KOL_perception_on_biomarkers"]}',
        specificityScore: "",
      },
    });
  } catch (err) {
    console.log("error triggering pipeline = ", err);
  }

  res.status(200).json({ message: "it ran successfully" });
});

export default router;
