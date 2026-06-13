import { Suspense } from "react";
import ResetPasswordForm from "@/components/account/reset-password-form";

export const metadata = {
  title: "Reset Password | YungDrip"
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="shell py-12"><div className="panel mx-auto h-72 max-w-lg animate-pulse" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
