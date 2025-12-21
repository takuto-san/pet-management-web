import { geistSans, geistMono } from "@/utils/font";

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
        {children}
      </body>
    </html>
  );
}

interface TopTemplateProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
  footer?: React.ReactNode;
}

export function TopTemplate({ header, sidebar, main, footer }: TopTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header>{header}</header>}
      <div className="flex flex-grow">
        {sidebar && <aside className="w-64">{sidebar}</aside>}
        {main && <main className="flex-grow">{main}</main>}
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
