interface SignupTemplateProps {
  header?: React.ReactNode;
  main?: React.ReactNode;
  footer?: React.ReactNode;
}

export function SignupTemplate({ header, main, footer }: SignupTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header>{header}</header>}
      {main && <main className="flex-grow">{main}</main>}
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
