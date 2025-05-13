// src/app/api/auth/[...nextauth]/pages-options.ts

import { routes } from '@/config/routes'
import { PagesOptions } from 'next-auth'

export const pagesOptions: Partial<PagesOptions> = {
  // página de login customizada
  signIn: routes.auth.signIn,
  // página de erro (vai para a mesma página de login, recebendo ?error=<code>)
  error: routes.auth.signIn,
}
