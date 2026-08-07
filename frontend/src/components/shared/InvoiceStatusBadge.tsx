import type { InvoiceStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  InvoiceStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "info" | "secondary" }
> = {
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  overdue: { label: "Overdue", variant: "destructive" },
  draft: { label: "Draft", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant as any}>{config.label}</Badge>;
}
