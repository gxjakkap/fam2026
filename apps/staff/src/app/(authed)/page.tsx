export const dynamic = "force-dynamic"

import Link from "next/link";

import { db } from "@repo/db";
import { desc } from "@repo/db/orm";
import { payment } from "@repo/db/schema";

import { getDashboardOverview } from "@/app/(authed)/actions";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function Home() {
  const overview = await getDashboardOverview();
  const latestPayments = await db
    .select({
      id: payment.id,
      payerName: payment.payerName,
      productName: payment.productName,
      status: payment.status,
      price: payment.price,
    })
    .from(payment)
    .orderBy(desc(payment.id))
    .limit(8);

  const formatCurrency = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return value;
    }
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(parsed);
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Backoffice</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor payment status and review submitted slips.
          </p>
        </div>
        <Button asChild>
          <Link href="/payments">Open payments</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total payments</CardDescription>
            <CardTitle className="text-2xl">{overview.totalPayments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending review</CardDescription>
            <CardTitle className="text-2xl">
              {overview.pendingPayments}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified payments</CardDescription>
            <CardTitle className="text-2xl">{overview.verifiedPayments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified revenue</CardDescription>
            <CardTitle className="text-2xl">
              {new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
                minimumFractionDigits: 2,
              }).format(overview.verifiedRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest payments</CardTitle>
          <CardDescription>Quick snapshot of payment records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                    No payments found.
                  </TableCell>
                </TableRow>
              ) : (
                latestPayments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link href={`/payments/${item.id}`} className="text-primary font-medium underline-offset-4 hover:underline">
                        {item.id}
                      </Link>
                    </TableCell>
                    <TableCell>{item.payerName}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
