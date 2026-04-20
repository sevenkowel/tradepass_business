import { redirect } from "next/navigation";

export default async function PortalIndex({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenantId = params.tenant;
  if (tenantId) {
    redirect(`/portal/dashboard?tenant=${tenantId}`);
  }
  redirect("/portal/dashboard");
}
