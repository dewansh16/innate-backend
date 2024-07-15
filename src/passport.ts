import { PrismaClient } from "@prisma/client";

const GoogleStrategy = require("passport-google-oauth20").Strategy;
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "your_google_client_id";
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "your_google_client_secret";

export function initPassport() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Missing environment variables for authentication providers"
    );
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      // @ts-ignore
      async function (accessToken, refreshToken, profile, done) {
        try {
          console.log("profile = ", profile);
          const user = await prisma.user.upsert({
            where: { email: profile.emails[0].value },
            update: { name: profile.displayName },
            create: {
              email: profile.emails[0].value,
              name: profile.displayName,
              image: profile.photos[0].value,
              provider: "GOOGLE",
            },
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, cb) => {
    process.nextTick(() => {
      console.log("from serialize user = ", user);
      return cb(null, user.id);
    });
  });

  passport.deserializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  // passport.deserializeUser(async (id, cb) => {
  //   try {
  //     const user = await prisma.user.findUnique({ where: { id: String(id) } });
  //     cb(null, user);
  //   } catch (error) {
  //     cb(error);
  //   }
  // });
}

// passport.serializeUser(function (user: any, cb) {
//   process.nextTick(function () {
//     return cb(null, {
//       id: user.id,
//       username: user.username,
//       picture: user.picture,
//     });
//   });
// });

// passport.deserializeUser(function (user: any, cb) {
//   process.nextTick(function () {
//     return cb(null, user);
//   });
// });
