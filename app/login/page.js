import AuthForm from "@/components/account/auth-form";

export const metadata = {
  title: "Login | YungDrip"
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
