import { ResumeStudio } from "@/components/folio/resume";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResumeStudio id={id} />;
}
