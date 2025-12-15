import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Ensure this API route is not statically generated
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    // After successful login, we'll redirect to signup to complete profile
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return true;
      }
      return false;
    },
    async redirect({ url, baseUrl }) {
      // Send newly signed-in users to signup form to complete details
      if (url.startsWith(baseUrl)) return url;
      // Default redirect to signup
      return `${baseUrl}/signup`;
    },
    async session({ session, token }) {
      // Ensure email is present in session
      if (token.email) session.user = { ...(session.user || {}), email: token.email } as any;
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = (profile as any).email;
        token.name = (profile as any).name;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
