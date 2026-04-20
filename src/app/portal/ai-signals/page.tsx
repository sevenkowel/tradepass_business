import { redirect } from "next/navigation";

export default async function AISignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenantId = params.tenant;
  if (tenantId) {
    redirect(`/portal/ai-signals/feed?tenant=${tenantId}`);
  }
  redirect("/portal/ai-signals/feed");
}
