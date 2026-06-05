import { randomBytes } from "node:crypto";
import { notifyNewsletterSubscription, sendNewsletterConfirmationEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export type NewsletterSubscribeStatus = "pending" | "already_confirmed";

export function isNewsletterConfirmed(sub: { confirmedAt: Date | null }): boolean {
  return sub.confirmedAt != null;
}

export function newConfirmToken(): string {
  return randomBytes(32).toString("hex");
}

export async function queueNewsletterConfirmation(
  subscriptionId: string,
  email: string,
  userId: string | null
): Promise<void> {
  const confirmToken = newConfirmToken();
  await prisma.newsletterSubscription.update({
    where: { id: subscriptionId },
    data: { confirmToken, confirmedAt: null },
  });
  sendNewsletterConfirmationEmail(email, confirmToken, Boolean(userId));
}

export type NewsletterConfirmResult =
  | { status: "confirmed"; email: string }
  | { status: "already_confirmed"; email: string }
  | { status: "invalid" };

export async function confirmNewsletterByToken(token: string): Promise<NewsletterConfirmResult> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { status: "invalid" };
  }

  const sub = await prisma.newsletterSubscription.findUnique({
    where: { confirmToken: trimmed },
  });
  if (!sub) {
    return { status: "invalid" };
  }

  if (isNewsletterConfirmed(sub)) {
    return { status: "already_confirmed", email: sub.email };
  }

  await prisma.newsletterSubscription.update({
    where: { id: sub.id },
    data: { confirmedAt: new Date(), confirmToken: null },
  });

  notifyNewsletterSubscription(sub.email, Boolean(sub.userId));

  return { status: "confirmed", email: sub.email };
}
