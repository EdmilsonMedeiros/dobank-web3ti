import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { env } from '@/env.mjs'
import { pagesOptions } from './pages-options'
import { routes } from '@/config/routes'
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      accessToken: string
      legacyLoginUrl?: string
    }
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id?: string | number
    email?: string
    accessToken?: string
    legacyLoginUrl?: string
  }
}

export const authOptions: NextAuthOptions = {
  pages: { ...pagesOptions },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Armazena id, email, accessToken e legacyLoginUrl no JWT interno
        token.id = (user as any).id
        token.email = (user as any).email
        token.accessToken = (user as any).accessToken
        token.legacyLoginUrl = (user as any).legacyLoginUrl
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id as string,
          email: token.email as string,
          accessToken: token.accessToken as string,
          legacyLoginUrl: token.legacyLoginUrl as string,
        },
      }
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}${routes.core.dashboard}`
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credenciais',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const apiBase = env.NEXT_PUBLIC_API_BASE_URL;

        const res = await fetch(`${apiBase}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || 'Falha no login')
        }

        // 2) Desestrutura legacy_login_url junto com o token e o user
        const { access_token, token_type, legacy_login_url, user } = await res.json() as {
          access_token: string
          token_type: string
          legacy_login_url: string
          user: {
            id: number
            email: string
            firstname: string
            lastname: string
          }
        }

        if (!user?.id) {
          throw new Error('Resposta de login sem dados de usuário')
        }

        // 3) Retorna o objeto que o NextAuth vai guardar no JWT
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstname} ${user.lastname}`,
          accessToken: access_token,
          legacyLoginUrl: legacy_login_url,
        }
      },
    }),

    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
}