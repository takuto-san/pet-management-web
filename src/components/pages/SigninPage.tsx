import { SigninTemplate } from "@/components/templates/SigninTemplate";
import AuthHeader from "@/components/organisms/AuthHeader";
import { SigninForm } from "@/components/organisms/SigninForm";

export function SigninPage() {
  return (
    <SigninTemplate
      header={<AuthHeader />}
      main={<SigninForm />}
    />
  );
}
