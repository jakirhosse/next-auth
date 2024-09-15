import connectDB from "@/lib/connectDb";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
export const authOptions = {
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter Email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter Password",
          required: true,
        },
      },

      async authorize(credentials) {
        const { email, password } = credentials;
        if (!credentials) {
          return null;
        }
        if (email) {
          const db = await connectDB();
          const currentuser = await db.collection("users").findOne({ email });
          // const currentuser = users.find((user)=> user.email === email)
          console.log(currentuser);
          if (currentuser) {
            if (currentuser.password === password) {
              return currentuser;
            }
          }
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    }),
    // FacebookProvider({
    //     clientId: process.env.FACEBOOK_CLIENT_ID,
    //     clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    // }),
    // GitHubProvider({
    //     clientId: process.env.NEXT_PUBLIC_GITHUB_ID,
    //     clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET
    //   })
  ],

  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.type = token.type;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
