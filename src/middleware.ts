import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
import withAuth from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: "/signin",
    ...pagesOptions,
  },
});

export const config = {
  // restricted routes
  matcher: [
    "/forms/:path*",   // todas as rotas /forms/** ficarão protegidas
    "/dashboard/:path*",
  ],
};
