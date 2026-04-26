"use server";

import { headers } from "next/headers";
import { count, sql } from "@repo/db/orm";

import { db } from "@repo/db";
import { payment, paymentSlip, paymentStatusEnum } from "@repo/db/schema";

import { auth } from "@/lib/auth";

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
}

export async function getDashboardOverview() {
  const [paymentSummary] = await db
    .select({
      totalPayments: count(payment.id),
      pendingPayments: sql<number>`sum(case when ${payment.status} = ${paymentStatusEnum.enumValues[0]} then 1 else 0 end)`,
      verifiedPayments: sql<number>`sum(case when ${payment.status} = ${paymentStatusEnum.enumValues[1]} then 1 else 0 end)`,
      failedPayments: sql<number>`sum(case when ${payment.status} = ${paymentStatusEnum.enumValues[2]} then 1 else 0 end)`,
      verifiedRevenue: sql<string>`coalesce(sum(case when ${payment.status} = ${paymentStatusEnum.enumValues[1]} then ${payment.price} else 0 end), 0)`,
    })
    .from(payment);

  const [slipSummary] = await db
    .select({
      totalSlips: count(paymentSlip.id),
      verifiedSlips: sql<number>`sum(case when ${paymentSlip.verifiedAt} is not null then 1 else 0 end)`,
    })
    .from(paymentSlip);

  return {
    totalPayments: Number(paymentSummary?.totalPayments ?? 0),
    pendingPayments: Number(paymentSummary?.pendingPayments ?? 0),
    verifiedPayments: Number(paymentSummary?.verifiedPayments ?? 0),
    failedPayments: Number(paymentSummary?.failedPayments ?? 0),
    verifiedRevenue: Number(paymentSummary?.verifiedRevenue ?? 0),
    totalSlips: Number(slipSummary?.totalSlips ?? 0),
    verifiedSlips: Number(slipSummary?.verifiedSlips ?? 0),
  };
}
