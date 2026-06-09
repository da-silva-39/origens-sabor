import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('Email não fornecido'), undefined);
      let user = await prisma.usuario.findUnique({ where: { email } });
      if (!user) {
        const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
        user = await prisma.usuario.create({
          data: {
            nome: profile.displayName || email.split('@')[0],
            email,
            senha: randomPassword,
            role: 'CLIENTE',
            isOAuth: true,
            ativo: true,
          }
        });
      } else if (!user.isOAuth) {
        user = await prisma.usuario.update({ where: { id: user.id }, data: { isOAuth: true } });
      }
      return done(null, user);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }
));

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
export default passport;