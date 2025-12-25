interface LayoutTemplateProps {
  header?: React.ReactNode;
  hamburgerBar?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
  footer?: React.ReactNode;
  isCentered?: boolean;
}

export function LayoutTemplate({ header, hamburgerBar, sidebar, main, footer, isCentered }: LayoutTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header>{header}</header>}
      {hamburgerBar && <div className="border-b border-gray-200 bg-white">{hamburgerBar}</div>}
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
