import { AuthTemplate } from "@/components/templates/AuthTemplate";
import AuthHeader from "@/components/organisms/AuthHeader";
import { SignupForm } from "@/components/organisms/SignupForm";

export function SignupPage() {
  return (
    <AuthTemplate
      header={<AuthHeader />}
      main={<SignupForm />}
    />
  );
}
