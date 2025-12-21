interface AuthTemplateProps {
  header?: React.ReactNode;
  main?: React.ReactNode;
  footer?: React.ReactNode;
  isCentered?: boolean;
}

export function AuthTemplate({ header, main, footer, isCentered }: AuthTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header>{header}</header>}
      <main className={`flex-grow ${isCentered ? "flex items-center justify-center" : ""}`}>
        {main}
      </main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
