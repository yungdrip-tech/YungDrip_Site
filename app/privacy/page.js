import LegalPage, { LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "Privacy Policy | YungDrip",
  description: "How YungDrip collects, uses, and protects your personal information."
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updatedAt="June 13, 2026">
      <LegalSection title="Overview">
        <p>
          YungDrip (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates this storefront and is committed to protecting
          your privacy. This policy explains what information we collect, how we use it, and the choices you have.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>When you use YungDrip, we may collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Account details such as name, email address, and phone number when you register.</li>
          <li>Order and shipping information required to fulfil purchases.</li>
          <li>Payment-related identifiers processed by Razorpay. We do not store full card numbers on our servers.</li>
          <li>Technical data such as IP address, browser type, and device information for security and fraud prevention.</li>
          <li>Cart and browsing activity needed to operate the store and improve your experience.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use your information">
        <p>We use personal information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and manage your account.</li>
          <li>Process orders, payments, deliveries, returns, and customer support requests.</li>
          <li>Send transactional emails such as order confirmations, shipping updates, and password reset links.</li>
          <li>Protect against fraud, abuse, and unauthorized access.</li>
          <li>Comply with applicable legal obligations.</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </LegalSection>

      <LegalSection title="Sharing with service providers">
        <p>
          We share data only with trusted providers needed to run the store, including payment processors (Razorpay),
          email delivery (Resend), and hosting/infrastructure partners. These providers may only use your data to perform
          services on our behalf and must protect it appropriately.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and local storage">
        <p>
          We use essential cookies and local storage to keep you signed in, maintain your cart, and secure the site.
          These are required for core store functionality.
        </p>
      </LegalSection>

      <LegalSection title="Data retention">
        <p>
          We retain account and order records for as long as needed to provide services, resolve disputes, enforce our
          agreements, and meet legal requirements. Session data expires automatically after a defined period of inactivity.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on your location, you may have the right to access, correct, or delete personal information we hold
          about you, or to object to certain processing. To make a request, contact us through your account page or the
          support email listed on our site.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use industry-standard measures including hashed passwords, HTTP-only session cookies, rate limiting, and
          origin validation on sensitive API routes. No method of transmission over the internet is completely secure,
          but we work to protect your data with reasonable safeguards.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected on this page with an
          updated date. Continued use of the site after changes constitutes acceptance of the revised policy.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For privacy-related questions, reach out via the contact details provided on your order confirmation email or
          through your YungDrip account.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
