import { redirect } from "next/navigation";

export default async function TradingPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenantId = params.tenant;
  if (tenantId) {
    redirect(`/portal/trading/accounts?tenant=${tenantId}`);
  }
  redirect("/portal/trading/accounts");
}
