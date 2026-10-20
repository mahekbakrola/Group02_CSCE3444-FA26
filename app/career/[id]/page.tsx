import { CareerExplorer } from "@/components/folio/career";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CareerExplorer id={id} />;
}
