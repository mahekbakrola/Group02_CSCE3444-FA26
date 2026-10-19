import { Jobs } from "@/components/folio/jobs";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Jobs id={id} />;
}
