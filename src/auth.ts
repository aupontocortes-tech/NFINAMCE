import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Twitter from 'next-auth/providers/twitter';

// AUTH_SECRET é obrigatório para o NextAuth. Sem ele aparece "Server error - problem with server configuration".
// Local: funciona com fallback. No Render: defina AUTH_SECRET nas variáveis de ambiente (recomendado).
const authSecret =
  process.env.AUTH_SECRET ||
  'nfinance-dev-secret-mude-em-producao';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })]
      : []),
    ...(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET
      ? [Facebook({ clientId: process.env.AUTH_FACEBOOK_ID, clientSecret: process.env.AUTH_FACEBOOK_SECRET })]
      : []),
    ...(process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET
      ? [Twitter({ clientId: process.env.AUTH_TWITTER_ID, clientSecret: process.env.AUTH_TWITTER_SECRET })]
      : []),
  ],
  callbacks: {
    async signIn({ user }) {
      return !!user?.email;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
