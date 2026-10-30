import { notFound } from "next/navigation";
import { isContentSection } from "@/lib/admin/content-sections";
import { AuthorizedContentEdit } from "@/components/admin/authorized-workspace";
import { adminPageContext } from "@/lib/admin/admin-page-context";
export default async function NewPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isContentSection(section)) notFound();
  const { service } = await adminPageContext();
  return <AuthorizedContentEdit service={service} section={section} id="new" creating />;
}
