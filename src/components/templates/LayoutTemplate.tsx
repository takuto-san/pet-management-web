interface LayoutTemplateProps {
  header?: React.ReactNode;
  hamburgerBar?: React.ReactNode;
  sidebar?: React.ReactNode;
  pageList?: React.ReactNode;
  main?: React.ReactNode;
  footer?: React.ReactNode;
  isCentered?: boolean;
  isSidebarOpen?: boolean;
}

export function LayoutTemplate({ header, hamburgerBar, sidebar, pageList, main, footer, isCentered, isSidebarOpen }: LayoutTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header>{header}</header>}
      {hamburgerBar && <div className="bg-white">{hamburgerBar}</div>}
      <div className="flex flex-grow">
        {sidebar && <aside className="w-64 pb-16">{sidebar}</aside>}
        {pageList && <aside className="w-64 pb-16">{pageList}</aside>}
        <main className={`flex-grow ${isCentered ? "flex items-center justify-center" : ""} pb-16`}>
          {main}
        </main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
