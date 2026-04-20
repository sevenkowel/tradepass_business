import { redirect } from "next/navigation";

export default async function IBPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenantId = params.tenant;
  if (tenantId) {
    redirect(`/portal/ib/overview?tenant=${tenantId}`);
  }
  redirect("/portal/ib/overview");
}
