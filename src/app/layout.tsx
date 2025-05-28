import type { Metadata } from "next";
import { inter, lexendDeca } from "@/app/fonts";
import cn from "@core/utils/class-names";
import NextProgress from "@core/components/next-progress";
// import HydrogenLayout from "@/layouts/hydrogen/layout";
import ConditionalLayout from './ConditionalLayout'
import { ThemeProvider, JotaiProvider } from "@/app/shared/theme-provider";
import GlobalDrawer from "@/app/shared/drawer-views/container";
import GlobalModal from "@/app/shared/modal-views/container";
import AuthProvider from "@/app/api/auth/[...nextauth]/auth-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dobank",
  description: "Write your app description",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      // 💡 Prevent next-themes hydration warning
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className={cn(inter.variable, lexendDeca.variable, "font-inter")}>
        <ThemeProvider>
          <NextProgress />
          <JotaiProvider>
            {/* SessionProvider via seu AuthProvider */}
            <AuthProvider session={undefined}>
              <ConditionalLayout>{children}</ConditionalLayout>
            </AuthProvider>
            <GlobalDrawer />
            <GlobalModal />
          </JotaiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
