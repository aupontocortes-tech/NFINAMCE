import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Twitter from 'next-auth/providers/twitter';

// AUTH_SECRET é obrigatório. Evita "Server error - problem with server configuration".
const authSecret =
  (process.env.AUTH_SECRET || '').trim() ||
  'nfinance-dev-secret-mude-em-producao';

const googleId = (process.env.AUTH_GOOGLE_ID || '').trim();
const googleSecret = (process.env.AUTH_GOOGLE_SECRET || '').trim();
const facebookId = (process.env.AUTH_FACEBOOK_ID || '').trim();
const facebookSecret = (process.env.AUTH_FACEBOOK_SECRET || '').trim();
const twitterId = (process.env.AUTH_TWITTER_ID || '').trim();
const twitterSecret = (process.env.AUTH_TWITTER_SECRET || '').trim();

const providers = [];
if (googleId && googleSecret) {
  providers.push(Google({ clientId: googleId, clientSecret: googleSecret }));
}
if (facebookId && facebookSecret) {
  providers.push(Facebook({ clientId: facebookId, clientSecret: facebookSecret }));
}
if (twitterId && twitterSecret) {
  providers.push(Twitter({ clientId: twitterId, clientSecret: twitterSecret }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers,
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
