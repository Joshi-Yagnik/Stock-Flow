import { useState } from "react";
import { Eye, Download, Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/shared/InvoiceStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { invoices } from "@/data/dummy";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/types";
import { toast } from "sonner";


const PAGE_SIZE = 8;
const STATUS_FILTERS: { label: string; value: InvoiceStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Overdue", value: "overdue" },
  { label: "Draft", value: "draft" },
];

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || inv.status === status;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        description="Manage and track all your invoices"
        breadcrumbs={[{ label: "Invoices" }]}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <SearchBar
          id="invoices-search"
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by invoice # or customer…"
          className="w-full sm:w-80"
        />
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                status === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable<Invoice>
        columns={[
          {
            key: "invoiceNumber",
            header: "Invoice #",
            render: (row) => (
              <span className="font-semibold text-primary text-sm font-mono">
                {row.invoiceNumber}
              </span>
            ),
          },
          {
            key: "customerName",
            header: "Customer",
            render: (row) => <span className="font-medium">{row.customerName}</span>,
          },
          {
            key: "createdAt",
            header: "Date",
            render: (row) => (
              <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>
            ),
          },
          {
            key: "dueDate",
            header: "Due Date",
            render: (row) => (
              <span className="text-muted-foreground">{formatDate(row.dueDate)}</span>
            ),
          },
          {
            key: "total",
            header: "Amount",
            render: (row) => (
              <span className="font-bold text-foreground">{formatCurrency(row.total)}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <InvoiceStatusBadge status={row.status} />,
          },
          {
            key: "actions",
            header: "",
            render: (row) => (
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => { e.stopPropagation(); setSelectedInvoice(row); }}
                  aria-label="View invoice"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => { e.stopPropagation(); toast.info("Download coming soon!"); }}
                  aria-label="Download invoice"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
            headerClassName: "text-right",
          },
        ]}
        data={paginated}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setSelectedInvoice(row)}
        emptyState={
          <div className="py-12 text-center">
            <Receipt className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium text-foreground">No invoices found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try changing your search or status filter.
            </p>
          </div>
        }
      />

      {filtered.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      {/* Invoice Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        {selectedInvoice && (
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-6">
                <span>{selectedInvoice.invoiceNumber}</span>
                <InvoiceStatusBadge status={selectedInvoice.status} />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Customer</p>
                  <p className="font-semibold">{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Date</p>
                  <p className="font-semibold">{formatDate(selectedInvoice.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Due Date</p>
                  <p className="font-semibold">{formatDate(selectedInvoice.dueDate)}</p>
                </div>
                {selectedInvoice.paidAt && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Paid On</p>
                    <p className="font-semibold text-emerald-600">{formatDate(selectedInvoice.paidAt)}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</p>
                {selectedInvoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1">
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                        {item.discount > 0 && ` (${item.discount}% off)`}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({selectedInvoice.taxRate}%)</span>
                  <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => toast.info("Download coming soon!")}>
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.info("Print coming soon!")}>
                  Print
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
