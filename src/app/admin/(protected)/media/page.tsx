import { AuthorizedMedia } from "@/components/admin/authorized-workspace";
import { CloudinaryMediaProvider } from "@/lib/admin/media-service";
import { adminPageContext } from "@/lib/admin/admin-page-context";

export default async function MediaPage() {
  const { service } = await adminPageContext();
  return (
    <AuthorizedMedia
      service={service}
      provider={new CloudinaryMediaProvider(() => service.authorize())}
    />
  );
}
