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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPassport = void 0;
const client_1 = require("@prisma/client");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your_google_client_id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your_google_client_secret";
function initPassport() {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error("Missing environment variables for authentication providers");
    }
    passport_1.default.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
    }, 
    // @ts-ignore
    function (accessToken, refreshToken, profile, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("profile = ", profile);
                const user = yield prisma.user.upsert({
                    where: { email: profile.emails[0].value },
                    update: { name: profile.displayName },
                    create: {
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        provider: "GOOGLE",
                    },
                });
                done(null, user);
            }
            catch (error) {
                done(error);
            }
        });
    }));
    passport_1.default.serializeUser((user, cb) => {
        process.nextTick(() => {
            console.log("from serialize user = ", user);
            return cb(null, user.id);
        });
    });
    passport_1.default.deserializeUser(function (user, cb) {
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
exports.initPassport = initPassport;
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
