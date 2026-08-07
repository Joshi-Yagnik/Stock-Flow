import { useState } from "react";
import { Plus, Pencil, Trash2, Users, Mail, Phone, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customers } from "@/data/dummy";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Customer } from "@/types";
import { toast } from "sonner";

const PAGE_SIZE = 8;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description={`${customers.length} registered customers`}
        breadcrumbs={[{ label: "Customers" }]}
        actions={
          <Button id="add-customer-btn" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar
          id="customers-search"
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name, email or company…"
          className="w-full sm:w-80"
        />
      </div>

      <DataTable<Customer>
        columns={[
          {
            key: "name",
            header: "Customer",
            render: (row) => (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(row.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{row.name}</p>
                  {row.company && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {row.company}
                    </p>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "email",
            header: "Contact",
            render: (row) => (
              <div>
                <p className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {row.email}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Phone className="h-3 w-3" />
                  {row.phone}
                </p>
              </div>
            ),
          },
          {
            key: "city",
            header: "Location",
            render: (row) => (
              <span className="text-muted-foreground">
                {row.city}, {row.state}
              </span>
            ),
          },
          {
            key: "totalOrders",
            header: "Orders",
            render: (row) => (
              <span className="font-medium">{row.totalOrders}</span>
            ),
          },
          {
            key: "totalSpent",
            header: "Total Spent",
            render: (row) => (
              <span className="font-semibold text-primary">
                {formatCurrency(row.totalSpent)}
              </span>
            ),
          },
          {
            key: "isActive",
            header: "Status",
            render: (row) => (
              <Badge variant={row.isActive ? "success" : "secondary"}>
                {row.isActive ? "Active" : "Inactive"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "",
            render: () => (
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => { e.stopPropagation(); toast.success("Edit coming soon!"); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => { e.stopPropagation(); toast.error("Delete coming soon!"); }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ),
            headerClassName: "text-right",
          },
        ]}
        data={paginated}
        keyExtractor={(row) => row.id}
        emptyState={
          <EmptyState
            icon={<Users className="h-8 w-8 text-muted-foreground" />}
            title="No customers found"
            description="Add your first customer to get started."
            action={
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" /> Add Customer
              </Button>
            }
          />
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Enter the customer's details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cust-name">Full Name *</Label>
                <Input id="cust-name" placeholder="Rajesh Sharma" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-company">Company</Label>
                <Input id="cust-company" placeholder="Sharma Enterprises" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cust-email">Email *</Label>
                <Input id="cust-email" type="email" placeholder="rajesh@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-phone">Phone *</Label>
                <Input id="cust-phone" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-address">Address</Label>
              <Input id="cust-address" placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cust-city">City</Label>
                <Input id="cust-city" placeholder="Bengaluru" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-gst">GST Number</Label>
                <Input id="cust-gst" placeholder="29AADCS1234F1Z5" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success("Customer added!"); setAddOpen(false); }}>
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
