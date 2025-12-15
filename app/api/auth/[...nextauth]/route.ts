import NextAuth, { NextAuthOptions } from "next-auth";

// Ensure this API route is not statically generated
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const authOptions: NextAuthOptions = {
  providers: [
    // Removed Google provider - using custom email/OTP authentication instead
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      return session;
    },
    async jwt({ token }: { token: any }) {
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
