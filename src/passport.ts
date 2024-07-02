const GoogleStrategy = require("passport-google-oauth20").Strategy;
import passport from "passport";
import dotenv from "dotenv";
// import { db } from './db';

dotenv.config();
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
      async function (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void
      ) {
        console.log("profile = ", profile);
        // const user = await db.user.upsert({
        //   create: {
        //     email: profile.emails[0].value,
        //     name: profile.displayName,
        //     provider: 'GOOGLE',
        //   },
        //   update: {
        //     name: profile.displayName,
        //   },
        //   where: {
        //     email: profile.emails[0].value,
        //   },
        // });

        // console.log('user = ', user);

        // done(null, user);
      }
    )
  );

  passport.serializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture,
      });
    });
  });

  passport.deserializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
}
