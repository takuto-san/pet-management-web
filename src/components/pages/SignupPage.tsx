import { SignupTemplate } from "@/components/templates/SignupTemplate";
import AuthHeader from "@/components/organisms/AuthHeader";
import { SignupForm } from "@/components/organisms/SignupForm";

export function SignupPage() {
  return (
    <SignupTemplate
      header={<AuthHeader />}
      main={<SignupForm />}
    />
  );
}
