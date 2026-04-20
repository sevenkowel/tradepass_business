import { redirect } from "next/navigation";

export default async function CopyTradingPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenantId = params.tenant;
  if (tenantId) {
    redirect(`/portal/copy-trading/discover?tenant=${tenantId}`);
  }
  redirect("/portal/copy-trading/discover");
}
