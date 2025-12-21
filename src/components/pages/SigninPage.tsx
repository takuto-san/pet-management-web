import { AuthTemplate } from "@/components/templates/AuthTemplate";
import AuthHeader from "@/components/organisms/AuthHeader";
import { SigninForm } from "@/components/organisms/SigninForm";

export function SigninPage() {
  return (
    <AuthTemplate
      header={<AuthHeader />}
      main={<SigninForm />}
      isCentered={true}
    />
  );
}
