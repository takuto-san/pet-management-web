interface LayoutTemplateProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
  footer?: React.ReactNode;
  isCentered?: boolean;
}

export function LayoutTemplate({ header, sidebar, main, footer, isCentered }: LayoutTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header>{header}</header>}
      <div className="flex flex-grow">
        {sidebar && <aside className="w-64">{sidebar}</aside>}
        <main className={`flex-grow ${isCentered ? "flex items-center justify-center" : ""} pb-16`}>
          {main}
        </main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
