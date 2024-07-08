"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
// import { db } from "../db";
const router = (0, express_1.Router)();
const CLIENT_URL = (_a = process.env.AUTH_REDIRECT_URL) !== null && _a !== void 0 ? _a : "http://localhost:3000/";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
// router.get("/refresh", async (req: Request, res: Response) => {
//   if (req.user) {
//     const user = req.user as User;
//     // Token is issued so it can be shared b/w HTTP and ws server
//     // Todo: Make this temporary and add refresh logic here
//     const userDb = await db.user.findFirst({
//       where: {
//         id: user.id,
//       },
//     });
//     const token = jwt.sign({ userId: user.id }, JWT_SECRET);
//     res.json({
//       token,
//       id: user.id,
//       name: userDb?.name,
//     });
//   } else {
//     res.status(401).json({ success: false, message: "Unauthorized" });
//   }
// });
router.get("/login/failed", (req, res) => {
    res.status(401).json({ success: false, message: "failure" });
});
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err);
            res.status(500).json({ error: "Failed to log out" });
        }
        else {
            res.clearCookie("jwt");
            res.redirect(`${CLIENT_URL}`);
        }
    });
});
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
}));
exports.default = router;
