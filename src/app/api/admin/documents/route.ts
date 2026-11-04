import { createDocumentRouteHandlers } from "@/lib/admin/document-http";
import { documentServiceFor } from "@/lib/admin/document-service-for";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const { GET, POST, PATCH, DELETE } = createDocumentRouteHandlers(documentServiceFor);
