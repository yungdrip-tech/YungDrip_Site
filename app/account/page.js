import AccountDashboard from "@/components/account/account-dashboard";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Account | YungDrip"
};

export default function AccountPage() {
  return (
    <div className="shell py-12">
      <Reveal>
        <AccountDashboard />
      </Reveal>
    </div>
  );
}
