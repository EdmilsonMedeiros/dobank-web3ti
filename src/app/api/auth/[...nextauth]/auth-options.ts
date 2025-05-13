// /src/app/api/auth/[...nextauth]/auth-options.ts
import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { env } from '@/env.mjs'
import { pagesOptions } from './pages-options'
import { routes } from '@/config/routes'

export const authOptions: NextAuthOptions = {
  pages: { ...pagesOptions },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Armazena id, email e accessToken no JWT interno
        token.id          = (user as any).id
        token.email       = (user as any).email
        token.accessToken = (user as any).accessToken
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id:          token.id as string,
          email:       token.email as string,
          accessToken: token.accessToken as string,
        },
      }
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}${routes.eCommerce.dashboard}`
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credenciais',
      credentials: {
        email:    { label: 'Email',    type: 'text' },
        password: { label: 'Senha',    type: 'password' },
      },
      async authorize(credentials) {
        const API = 'https://crypto.web3ti.com.br'

        // 1) Executa o login e já recebe o user embutido
        const res = await fetch(`${API}/api/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            email:    credentials?.email,
            password: credentials?.password,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || 'Falha no login')
        }

        const { access_token, token_type, user } = await res.json() as {
          access_token: string
          token_type:   string
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

        // 2) Retorna o objeto que o NextAuth vai guardar no JWT
        return {
          id:          user.id,
          email:       user.email,
          name:        `${user.firstname} ${user.lastname}`,
          accessToken: access_token,
        }
      },
    }),

    GoogleProvider({
      clientId:  env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
}
