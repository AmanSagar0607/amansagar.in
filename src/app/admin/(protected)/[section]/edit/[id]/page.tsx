import { notFound } from "next/navigation";
import { isContentSection } from "@/lib/admin/content-sections";
import { AuthorizedContentEdit } from "@/components/admin/authorized-workspace";
import { adminPageContext } from "@/lib/admin/admin-page-context";
export default async function EditPage({ params }: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params;
  if (!isContentSection(section) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 120) notFound();
  const { service } = await adminPageContext();
  return <AuthorizedContentEdit service={service} section={section} id={id} creating={false} />;
}
