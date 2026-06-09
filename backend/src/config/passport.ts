import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Email não fornecido pelo Google'), undefined);
        }

        // Verifica se o utilizador já existe
        let user = await prisma.usuario.findUnique({ where: { email } });

        if (!user) {
          // Cria um novo utilizador com senha aleatória (não será usada para login)
          const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
          user = await prisma.usuario.create({
            data: {
              nome: profile.displayName || email.split('@')[0],
              email,
              senha: randomPassword,
              role: 'CLIENTE',
              isOAuth: true,          // Marca como conta OAuth (Google)
              ativo: true,
            },
          });
        } else {
          // Se o utilizador já existe mas não tem isOAuth = true, atualiza (caso tenha sido criado por email/senha e agora usa Google)
          if (!user.isOAuth) {
            user = await prisma.usuario.update({
              where: { id: user.id },
              data: { isOAuth: true },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialização: guarda apenas o ID do utilizador na sessão
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Desserialização: recupera o utilizador pelo ID
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;