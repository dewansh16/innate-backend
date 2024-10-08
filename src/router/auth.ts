import { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
// import { db } from "../db";
const router = Router();

const CLIENT_URL = process.env.AUTH_REDIRECT_URL || "http://localhost:3000/";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

interface User {
  id: string;
}

const prisma = new PrismaClient();

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

router.get("/self", async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as User;

    const userData = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    res.status(200).json({
      id: user.id,
      ...userData,
    });
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

router.get("/login/failed", (req: Request, res: Response) => {
  res.status(401).json({ success: false, message: "failure" });
});

router.get("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).json({ error: "Failed to log out" });
    } else {
      res.clearCookie("jwt");
      res.redirect(`${CLIENT_URL}`);
    }
  });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

export default router;
