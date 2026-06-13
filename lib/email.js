import { Resend } from "resend";

function getAppUrl() {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

function buildHtml({ title, bodyLines, ctaLabel, ctaUrl }) {
  const lines = bodyLines.map((line) => `<p style="margin:0 0 12px;color:#333;line-height:1.6;">${line}</p>`).join("");
  const cta = ctaLabel && ctaUrl
    ? `<p style="margin:24px 0 0;"><a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:999px;font-size:14px;">${ctaLabel}</a></p>`
    : "";

  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f7f7f7;padding:24px;"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:32px;"><h1 style="margin:0 0 16px;font-size:24px;">${title}</h1>${lines}${cta}<p style="margin:32px 0 0;font-size:12px;color:#888;">YungDrip</p></div></body></html>`;
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject) {
    return { sent: false, reason: "missing_recipient_or_subject" };
  }

  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email:dev]", { to, subject, text });
    }

    return { sent: false, reason: "not_configured" };
  }

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text,
      html
    });

    if (error) {
      console.error("[email:error]", error.message);
      return { sent: false, reason: error.message };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email:error]", error.message);
    return { sent: false, reason: error.message };
  }
}

export function sendWelcomeEmail(user) {
  const appUrl = getAppUrl();

  return sendEmail({
    to: user.email,
    subject: "Welcome to YungDrip",
    text: `Hi ${user.name},\n\nYour YungDrip account is ready. Start shopping at ${appUrl}/shop.`,
    html: buildHtml({
      title: "Welcome to YungDrip",
      bodyLines: [
        `Hi ${user.name},`,
        "Your account is ready. Explore the latest drops and track every order from your account dashboard."
      ],
      ctaLabel: "Start Shopping",
      ctaUrl: `${appUrl}/shop`
    })
  });
}

export function sendPasswordResetEmail(user, resetUrl) {
  return sendEmail({
    to: user.email,
    subject: "Reset your YungDrip password",
    text: `Hi ${user.name},\n\nReset your password using this link (valid for 1 hour):\n${resetUrl}`,
    html: buildHtml({
      title: "Reset your password",
      bodyLines: [
        `Hi ${user.name},`,
        "We received a request to reset your YungDrip password. This link expires in 1 hour."
      ],
      ctaLabel: "Reset Password",
      ctaUrl: resetUrl
    })
  });
}

export function sendOrderConfirmationEmail(order) {
  const appUrl = getAppUrl();
  const total = order.pricing?.total;
  const currency = order.pricing?.currency || "INR";

  return sendEmail({
    to: order.shippingAddress.email,
    subject: `Order confirmed — ${order.orderNumber}`,
    text: `Your order ${order.orderNumber} is confirmed. Total: ${currency} ${total}. Track it at ${appUrl}/account/orders/${order._id}.`,
    html: buildHtml({
      title: "Order confirmed",
      bodyLines: [
        `Order ${order.orderNumber} is confirmed.`,
        `Total: ${currency} ${total}`,
        "We will notify you when your order ships."
      ],
      ctaLabel: "View Order",
      ctaUrl: `${appUrl}/account/orders/${order._id}`
    })
  });
}

export function sendOrderStatusEmail(order, status) {
  const appUrl = getAppUrl();
  const label = status.replaceAll("_", " ");

  return sendEmail({
    to: order.shippingAddress.email,
    subject: `Order ${order.orderNumber} — ${label}`,
    text: `Your order ${order.orderNumber} is now ${label}. Track it at ${appUrl}/account/orders/${order._id}.`,
    html: buildHtml({
      title: `Order update: ${label}`,
      bodyLines: [
        `Order ${order.orderNumber} is now ${label}.`,
        "Open your account to see the full timeline."
      ],
      ctaLabel: "Track Order",
      ctaUrl: `${appUrl}/account/orders/${order._id}`
    })
  });
}
