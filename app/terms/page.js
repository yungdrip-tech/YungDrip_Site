import LegalPage, { LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "Terms of Service | YungDrip",
  description: "Terms and conditions for using the YungDrip online store."
};

export default function TermsOfServicePage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updatedAt="June 13, 2026">
      <LegalSection title="Agreement">
        <p>
          By accessing or purchasing from YungDrip, you agree to these Terms of Service. If you do not agree, please do
          not use the site.
        </p>
      </LegalSection>

      <LegalSection title="Eligibility">
        <p>
          You must be at least 18 years old or have permission from a parent or legal guardian to create an account and
          place orders. You are responsible for keeping your login credentials confidential.
        </p>
      </LegalSection>

      <LegalSection title="Products and pricing">
        <p>
          We strive to display accurate product descriptions, images, sizes, colors, and prices. Minor variations in
          colour, fit, or material may occur. Prices are shown in the store currency and may change without notice until
          an order is confirmed at checkout.
        </p>
        <p>
          Product availability is subject to stock levels. We reserve the right to limit quantities, cancel orders affected
          by pricing or inventory errors, and refuse service in cases of suspected fraud or abuse.
        </p>
      </LegalSection>

      <LegalSection title="Orders and payment">
        <p>
          Placing an order constitutes an offer to purchase. An order is confirmed only after successful payment
          verification through Razorpay. We may cancel or refuse any order before shipment for reasons including stock
          unavailability, payment failure, or suspected fraudulent activity.
        </p>
      </LegalSection>

      <LegalSection title="Shipping">
        <p>
          Estimated delivery timelines are provided at checkout and in order confirmations. Shipping fees may apply based
          on order value and destination. Risk of loss passes to you upon delivery to the address you provide.
        </p>
      </LegalSection>

      <LegalSection title="Returns and refunds">
        <p>
          Returns and refunds are governed by our separate Refund & Return Policy. Please review that page before
          purchasing.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the site for unlawful purposes or to violate others&apos; rights.</li>
          <li>Attempt to bypass security, scrape data, or interfere with site operation.</li>
          <li>Submit false information during registration or checkout.</li>
          <li>Resell products obtained through unauthorized bulk purchases or promotional abuse.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          All content on YungDrip — including branding, photography, copy, and site design — is owned by or licensed to
          YungDrip and may not be copied or reused without permission.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer of warranties">
        <p>
          The site and products are provided on an &quot;as is&quot; and &quot;as available&quot; basis to the fullest extent permitted
          by law. We disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement except
          where such disclaimers are not allowed.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, YungDrip is not liable for indirect, incidental, special, or
          consequential damages arising from your use of the site or purchase of products. Our total liability for any
          claim related to an order is limited to the amount you paid for that order.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the
          courts located in the city where YungDrip is registered or operates, unless otherwise required by applicable
          consumer protection law.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may revise these Terms of Service at any time. Updated terms take effect when posted on this page. Your
          continued use of the site after changes constitutes acceptance.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
