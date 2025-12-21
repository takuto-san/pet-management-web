import { LayoutTemplate } from "@/components/templates/LayoutTemplate";
import { Header } from "@/components/organisms/Header";
import { TopContent } from "@/components/organisms/TopContent";

export function TopPage() {
  return (
    <LayoutTemplate
      header={<Header />}
      main={<TopContent />}
    />
  );
}
