import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// URL base do backend em produção (use variável de ambiente ou valor fixo)
const BACKEND_URL = process.env.BACKEND_URL || 'https://origens-sabor-backend.onrender.com';
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const googleOAuthConfigured = Boolean(googleClientId && googleClientSecret);

if (googleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId!,
        clientSecret: googleClientSecret!,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
        passReqToCallback: false,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('Email não fornecido'), undefined);

          let user = await prisma.usuario.findUnique({ where: { email } });

          if (user && !user.ativo) {
            return done(new Error('Conta desativada'), undefined);
          }

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
              },
            });
          } else if (!user.isOAuth) {
            user = await prisma.usuario.update({
              where: { id: user.id },
              data: { isOAuth: true },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn('Google OAuth não configurado. Login com Google desativado.');
}

export default passport;