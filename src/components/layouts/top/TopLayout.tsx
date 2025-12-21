import { geistSans, geistMono } from "@/utils/font";
import { StoreProvider } from "@/lib/stores/StoreProvider";
import { QueryProvider } from "@/lib/stores/QueryProvider";
import { AuthProvider } from "@/components/organisms/AuthProvider";

export function TopLayoutWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
          <QueryProvider>
            <StoreProvider>
              <AuthProvider>{children}</AuthProvider>
            </StoreProvider>
          </QueryProvider>
      </body>
    </html>
  );
}

import { Header } from "@/components/organisms/Header";
import { TopContent } from "@/components/organisms/TopContent";

export function TopLayout() {
  return (
    <>
      <Header />
      <TopContent />
    </>
  );
}
