import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Users, Mail, Phone, Building2, Search, Loader2, Check } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Customer } from "@/types";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, createCustomer, deleteCustomer } from "@/lib/api/customers";
import { useGoogleContacts, GoogleContact } from "@/hooks/useGoogleContacts";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleProviderWrapper({ children }: { children: (google: any) => React.ReactNode }) {
  if (!GOOGLE_CLIENT_ID) {
    return <>{children({
      contacts: [],
      isConnected: false,
      isConnecting: false,
      isExpired: false,
      connect: () => toast.error("Google Contacts is not configured."),
      isLoadingContacts: false,
      disabled: true
    })}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleHookWrapper>{children}</GoogleHookWrapper>
    </GoogleOAuthProvider>
  );
}

function GoogleHookWrapper({ children }: { children: (google: any) => React.ReactNode }) {
  const google = useGoogleContacts();
  return <>{children({ ...google, disabled: false })}</>;
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["customers", { page, search }],
    queryFn: () => getCustomers(search),
  });

  const customers = data?.data || [];
  const totalItems = data?.total || 0;
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  // Suggested contacts are now filtered inside the render wrapper

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer added successfully!");
      setAddOpen(false);
      setFormData({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add customer");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted!");
    },
    onError: () => toast.error("Failed to delete customer")
  });

  const handleSaveCustomer = () => {
    if (!formData.name) {
      toast.error("Full name is required.");
      return;
    }
    if (!formData.phone) {
      toast.error("Phone number is required.");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleAddGoogleContact = (contact: GoogleContact) => {
    // Check for duplicates in the local customers list (page might not have all, but we check what we can)
    // Real protection is done by the backend returning a 400 or the unique constraint,
    // but we can try checking against the current page of customers.
    const isDuplicate = customers.some(c => 
      (contact.email && (c.mobileNumber === contact.email)) || 
      (contact.phone && (c.phone === contact.phone || c.mobileNumber === contact.phone))
    );

    if (isDuplicate) {
      toast.error("Already a customer");
      return;
    }

    // Direct add if possible, otherwise open modal
    createMutation.mutate({
      name: contact.name,
      mobileNumber: contact.email || "", // we mapped email to mobileNumber in the backend unfortunately
      phone: contact.phone || contact.email || "",
    }, {
      onSuccess: () => {
        // Handled by the mutation's onSuccess above
      }
    });
  };

  if (isError) {
    console.error("Failed to load customers:", error);
    let errorMessage = "Unable to load customers.";
    if (error && (error as any).response) {
      const status = (error as any).response.status;
      if (status === 401) errorMessage = "Your session has expired. Please sign in again.";
      else if (status === 403) errorMessage = "You do not have permission to view these customers.";
      else if (status === 404) errorMessage = "Customer API endpoint not found.";
      else if (status === 500) errorMessage = "Server error while loading customers.";
    }

    return (
      <div className="space-y-5">
        <PageHeader
          title="Customers"
          description="Manage your customers"
          breadcrumbs={[{ label: "Customers" }]}
        />
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <p className="text-destructive font-medium">{errorMessage}</p>
          <Button onClick={() => refetch()} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <GoogleProviderWrapper>
      {(google) => {
        const { 
          contacts: googleContactsRaw, 
          isConnected: isGoogleConnected, 
          isConnecting: isGoogleConnecting,
          isExpired: isGoogleExpired,
          connect: connectGoogle, 
          isLoadingContacts: isGoogleLoading,
          disabled: isGoogleDisabled
        } = google;

        let suggestedGoogleContacts: GoogleContact[] = [];
        if (search && search.trim().length > 0 && googleContactsRaw) {
          const lowerSearch = search.toLowerCase();
          suggestedGoogleContacts = googleContactsRaw.filter((c: GoogleContact) => 
            c.name?.toLowerCase().includes(lowerSearch) ||
            c.email?.toLowerCase().includes(lowerSearch) ||
            c.phone?.includes(lowerSearch)
          );
        }

        return (
          <div className="space-y-5">
            <PageHeader
              title="Customers"
        description={`${totalItems} registered customers`}
        breadcrumbs={[{ label: "Customers" }]}
        actions={
          <Button id="add-customer-btn" onClick={() => { setFormData({}); setAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email or company…"
            className="pl-9"
          />
        </div>
        
        <div>
          {isGoogleDisabled ? (
            <Button variant="outline" disabled title="Google Contacts integration is not configured">
              Google Contacts Not Configured
            </Button>
          ) : !isGoogleConnected ? (
            <Button variant="outline" onClick={connectGoogle} disabled={isGoogleConnecting}>
              {isGoogleConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Google Contacts
            </Button>
          ) : isGoogleExpired ? (
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={connectGoogle}>
              Reconnect Google Contacts
            </Button>
          ) : (
            <Button variant="outline" disabled className="text-green-600 border-green-200 bg-green-50/50 dark:bg-green-900/20 dark:border-green-900">
              <Check className="mr-2 h-4 w-4" />
              Google Contacts Connected
            </Button>
          )}
        </div>
      </div>

      {isGoogleExpired && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 flex items-center justify-between">
          <p>Your Google Contacts connection has expired.</p>
          <Button variant="ghost" size="sm" onClick={connectGoogle}>Reconnect</Button>
        </div>
      )}

      {search && suggestedGoogleContacts.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 border-b bg-muted/40">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <img src="https://www.gstatic.com/images/branding/product/1x/contacts_48dp.png" alt="Google Contacts" className="w-4 h-4 rounded-full" />
              Google Contacts Suggestions
            </h3>
          </div>
          <div className="divide-y">
            {suggestedGoogleContacts.slice(0, 5).map((contact, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={contact.photo || undefined} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-foreground">{contact.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {contact.email && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </p>
                      )}
                      {contact.phone && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleAddGoogleContact(contact)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add as Customer
                </Button>
              </div>
            ))}
            {suggestedGoogleContacts.length > 5 && (
              <div className="px-4 py-2 text-xs text-center text-muted-foreground bg-muted/20">
                + {suggestedGoogleContacts.length - 5} more matching contacts
              </div>
            )}
          </div>
        </div>
      )}

      {search && <h3 className="text-sm font-medium text-muted-foreground px-1 pb-1">StockFlow Customers</h3>}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      ) : (
        <>
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
                key: "mobileNumber",
                header: "Contact",
                render: (row) => (
                  <div>
                    {row.mobileNumber && (
                      <p className="flex items-center gap-1.5 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {row.mobileNumber}
                      </p>
                    )}
                    {row.phone && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Phone className="h-3 w-3" />
                        {row.phone}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: "city",
                header: "Location",
                render: (row) => (
                  <span className="text-muted-foreground">
                    {[row.city, row.state].filter(Boolean).join(", ") || "—"}
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
                render: (row) => (
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
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if(confirm("Are you sure you want to delete this customer?")) {
                          deleteMutation.mutate(row.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ),
                headerClassName: "text-right",
              },
            ]}
            data={customers}
            keyExtractor={(row) => row.id}
            emptyState={
              <EmptyState
                icon={<Users className="h-8 w-8 text-muted-foreground" />}
                title={search ? "No customers match your search" : "No customers yet"}
                description={search ? "Try a different search term" : "Add your first customer to get started."}
                action={
                  <div className="flex gap-3">
                    <Button onClick={() => { setFormData({}); setAddOpen(true); }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Customer
                    </Button>
                  </div>
                }
              />
            }
          />

          {totalItems > PAGE_SIZE && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalItems}
              limit={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </>
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
                <Input 
                  id="cust-name" 
                  value={formData.name || ""} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Milan" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-company">Company</Label>
                <Input 
                  id="cust-company" 
                  value={formData.company || ""} 
                  onChange={(e) => setFormData({...formData, company: e.target.value})} 
                  placeholder="" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cust-mobileNumber">Email</Label>
                <Input 
                  id="cust-mobileNumber" 
                  type="email" 
                  value={formData.mobileNumber || ""} 
                  onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} 
                  placeholder="" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-phone">Phone *</Label>
                <Input 
                  id="cust-phone" 
                  value={formData.phone || ""} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  placeholder="e.g. 7600140128" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-address">Address</Label>
              <Input 
                id="cust-address" 
                value={formData.address || ""} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                placeholder="" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cust-city">City</Label>
                <Input 
                  id="cust-city" 
                  value={formData.city || ""} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})} 
                  placeholder="" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust-gst">GST Number</Label>
                <Input 
                  id="cust-gst" 
                  value={formData.gstNumber || ""} 
                  onChange={(e) => setFormData({...formData, gstNumber: e.target.value})} 
                  placeholder="" 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCustomer} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
        );
      }}
    </GoogleProviderWrapper>
  );
}
