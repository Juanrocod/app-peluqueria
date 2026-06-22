import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute =
        nextUrl.pathname.startsWith("/admin") ||
        nextUrl.pathname.startsWith("/api/admin");
      const isLoginPage = nextUrl.pathname === "/login";
      const isRegistroPage = nextUrl.pathname === "/registro";

      if (isAdminRoute) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        const role = (auth?.user as { role?: string })?.role;
        if (role !== "ADMIN") return Response.redirect(new URL("/login", nextUrl));
        return true;
      }
      if ((isLoginPage || isRegistroPage) && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
