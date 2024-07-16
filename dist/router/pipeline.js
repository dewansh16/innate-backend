"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schemas_1 = require("../validations/schemas");
const sessionManager_1 = require("../sessionManager");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
const sessionManager = sessionManager_1.SessionManager.getInstance();
const ENDPOINT = (_a = process.env.PIPELINE_URL) !== null && _a !== void 0 ? _a : "http://localhost:5000";
router.get("/trigger", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let data = req.body;
    data = Object.assign(Object.assign({}, data), { projectConfig: JSON.stringify(req.body.projectConfig) });
    let requestBody;
    console.log("req.body = ", req.body);
    try {
        requestBody = schemas_1.triggerPipelineSchema.parse(data);
        console.log("Request body parsed successfully:", requestBody);
    }
    catch (error) {
        return res.status(400).json({ error: "Invalid request body format" });
    }
    console.log("requestBody = ", requestBody);
    const { projectConfig } = requestBody;
    console.log("projectConfig = ", projectConfig);
    try {
        yield axios_1.default.post(`${ENDPOINT}/trigger-pipeline`, {
            project_config: projectConfig,
            message: {
                sessionId: "clymjpbjk016bhy06kla6ivql",
                nextState: "None",
                selectedComponent: "InsightModelRefinement",
                userMessage: "",
                agentResponseMessage: "1",
                insightModelStatus: "None",
                refinedQueries: '{"arr":["What are the current challenges in identifying and validating biomarkers for combination therapies?","How do Key Opinion Leaders in the field of oncology perceive the role of biomarkers in predicting treatment outcomes for combination therapies?"]}',
                insightModel: '{"enrichments":{"classification_labels":["Key_Opinion_Leaders","biomarker_development","treatment"]}}',
                type: "ANSWER",
                data: "",
                context: "",
                suggestedLabels: '{"enrichments":["biomarker_validation","KOL_perception_on_biomarkers"]}',
                specificityScore: "",
            },
        });
    }
    catch (err) {
        console.log("error triggering pipeline = ", err);
    }
    res.status(200).json({ message: "it ran successfully" });
}));
exports.default = router;
