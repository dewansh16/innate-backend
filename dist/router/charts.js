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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schemas_1 = require("../validations/schemas");
const sessionManager_1 = require("../sessionManager");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const sessionManager = sessionManager_1.SessionManager.getInstance();
const db = new client_1.PrismaClient();
// const ENDPOINT = process.env.PIPELINE_URL ?? "http://localhost:5000";
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let receivedData = req.body;
    receivedData = Object.assign(Object.assign({}, receivedData), { data: JSON.stringify(req.body.data) });
    let requestBody;
    console.log("req.body = ", req.body);
    try {
        requestBody = schemas_1.graphSchema.parse(receivedData);
        console.log("Request body parsed successfully:", requestBody);
    }
    catch (error) {
        return res.status(400).json({ error: "Invalid request body format" });
    }
    console.log("requestBody = ", requestBody);
    try {
        const newChart = yield db.charts.create({
            data: Object.assign({}, requestBody),
        });
        console.log("newChart = ", newChart);
    }
    catch (err) {
        console.log("error storing to db");
        return res.status(400).json({ error: "db error" });
    }
    res.status(200).json({ message: "it ran successfully" });
}));
router.get("/:userId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    console.log("userId = ", userId);
    try {
        const charts = yield db.charts.findMany({
            where: {
                userId,
            },
        });
        res.status(200).json({ data: charts });
    }
    catch (err) {
        console.error("Error creating chart:", err);
        res.status(500).json({ error: "Failed to create session" });
    }
}));
exports.default = router;
