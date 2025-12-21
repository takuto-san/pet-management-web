import { TopTemplate } from "@/components/templates/TopTemplate";
import { Header } from "@/components/organisms/Header";
import { TopContent } from "@/components/organisms/TopContent";

export function TopPage() {
  return (
    <TopTemplate
      header={<Header />}
      main={<TopContent />}
    />
  );
}
