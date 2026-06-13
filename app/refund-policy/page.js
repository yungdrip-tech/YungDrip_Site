import LegalPage, { LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "Refund & Return Policy | YungDrip",
  description: "YungDrip refund, return, and exchange policy for online orders."
};

export default function RefundPolicyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Refund & Return Policy" updatedAt="June 13, 2026">
      <LegalSection title="Overview">
        <p>
          We want you to love what you ordered. If something isn&apos;t right, this policy explains how returns, exchanges,
          and refunds work for YungDrip purchases made through our website.
        </p>
      </LegalSection>

      <LegalSection title="Return window">
        <p>
          You may request a return within <strong>7 days</strong> of delivery for eligible items. Items must be unworn,
          unwashed, undamaged, and returned with original tags and packaging where applicable.
        </p>
      </LegalSection>

      <LegalSection title="Eligible items">
        <p>Returns are accepted for:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Items received in defective or damaged condition.</li>
          <li>Incorrect size, colour, or product shipped due to our error.</li>
          <li>Standard apparel and accessories in resaleable condition.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Non-returnable items">
        <p>The following are generally not eligible for return unless defective:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Items marked final sale or purchased during clearance promotions.</li>
          <li>Products showing signs of wear, alteration, washing, or damage after delivery.</li>
          <li>Items returned without tags or in incomplete packaging.</li>
          <li>Gift cards or digital products, if offered.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How to initiate a return">
        <p>To start a return:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Sign in to your YungDrip account and open the order from your order history.</li>
          <li>Contact support with your order number, item details, and reason for return.</li>
          <li>Wait for return authorization and shipping instructions before sending items back.</li>
        </ol>
        <p>
          Unauthorized returns — items sent back without approval — may not be accepted or refunded.
        </p>
      </LegalSection>

      <LegalSection title="Exchanges">
        <p>
          Exchanges for a different size or colour are subject to availability. If the requested replacement is
          unavailable, we will offer a refund to your original payment method instead.
        </p>
      </LegalSection>

      <LegalSection title="Refunds">
        <p>
          Once we receive and inspect your return, approved refunds are processed to the original payment method used at
          checkout. Refund timing depends on your bank or card issuer and typically appears within <strong>5–10 business
          days</strong> after approval.
        </p>
        <p>
          Shipping charges are non-refundable except where the return is due to our error or a defective product.
          Return shipping costs are the customer&apos;s responsibility unless otherwise stated in your return authorization.
        </p>
      </LegalSection>

      <LegalSection title="Cancellations">
        <p>
          Orders may be cancelled before shipment. If payment was captured and the order has not yet shipped, contact us
          promptly through your account. Once an order has shipped, our standard return process applies.
        </p>
      </LegalSection>

      <LegalSection title="Damaged or incorrect deliveries">
        <p>
          If your order arrives damaged or incorrect, contact us within 48 hours of delivery with photos of the item and
          packaging. We will arrange a replacement or full refund at no additional cost where applicable.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          For return status or policy questions, refer to your order confirmation email or reach out through your
          YungDrip account. Include your order number in all correspondence so we can assist you faster.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
