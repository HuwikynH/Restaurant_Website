const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "emails", "name"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ facebookId: profile.id });

          if (!user) {
            const existingUser = await User.findOne({
              email: profile.emails[0].value,
            });
            if (existingUser) {
              return done(null, false, {
                message:
                  "Email đã tồn tại. Vui lòng đăng nhập bằng tài khoản đã liên kết.",
              });
            }
            user = await User.create({
              facebookId: profile.id,
              email: profile.emails[0].value,
              name: `${profile.name.givenName} ${profile.name.familyName}`,
              provider: "facebook",
              isVerified: true,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            const existingUser = await User.findOne({
              email: profile.emails[0].value,
            });
            if (existingUser) {
              return done(null, false, {
                message:
                  "Email đã tồn tại. Vui lòng đăng nhập bằng tài khoản đã liên kết.",
              });
            }
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              provider: "google",
              isVerified: true,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};
