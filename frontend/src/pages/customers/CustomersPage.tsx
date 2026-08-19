import { useState } from "react";
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
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkCreateCustomers,
  getAllCustomerIdentifiers,
  CustomerIdentifier,
} from "@/lib/api/customers";
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
  
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleModalSearch, setGoogleModalSearch] = useState("");

  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkSummaryResult, setBulkSummaryResult] = useState<{ total: number; created: number; skipped: number } | null>(null);
  
  const queryClient = useQueryClient();

  // Query paginated relevant customers with caching for fast responsiveness
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["customers", { page, search }],
    queryFn: () => getCustomers(page, 20, search),
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
  });

  const customers = data?.data || [];
  const totalItems = data?.total || 0;
  const PAGE_SIZE = 20;
  const totalPages = data?.totalPages || Math.ceil(totalItems / PAGE_SIZE) || 1;

  // Query lightweight list of all stored customers ONLY when Google Modal is open
  const { data: allIdentifiers } = useQuery<CustomerIdentifier[]>({
    queryKey: ["all-customer-identifiers"],
    queryFn: getAllCustomerIdentifiers,
    enabled: googleModalOpen,
    staleTime: 300000,
  });

  // Check if a Google contact is already added in StockFlow customers DB
  const isContactAdded = (contact: GoogleContact) => {
    const cleanEmail = contact.email?.trim().toLowerCase();
    const cleanPhone = contact.phone?.replace(/\D/g, "");
    const cleanName = contact.name?.trim().toLowerCase();

    const listToCheck = allIdentifiers || customers;

    return listToCheck.some((c: any) => {
      const cEmail = (c.email || c.mobileNumber)?.trim().toLowerCase();
      const cPhone = c.phone?.replace(/\D/g, "");
      const cName = c.name?.trim().toLowerCase();

      if (cleanEmail && cEmail && cleanEmail === cEmail) return true;
      if (cleanPhone && cPhone && cleanPhone.length >= 7 && cleanPhone === cPhone) return true;
      if (cleanName && cName && cleanName === cName && (cleanEmail || cleanPhone)) return true;
      return false;
    });
  };

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onMutate: () => {
      setSearch("");
    },
    onSuccess: (newCustomer: Customer) => {
      queryClient.setQueriesData({ queryKey: ["customers"] }, (oldData: any) => {
        if (!oldData) return { data: [newCustomer], total: 1 };
        const exists = oldData.data?.some((c: Customer) => c.id === newCustomer.id);
        if (exists) return oldData;
        return {
          ...oldData,
          data: [{ ...newCustomer, showInMainList: true }, ...(oldData.data || [])],
          total: (oldData.total || 0) + 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customer-identifiers"] });

      toast.success("Customer added successfully!");
      setAddOpen(false);
      setFormData({});
      setSearch("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add customer");
    },
    onSettled: () => {
      setAddingKey(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => updateCustomer(id, data),
    onMutate: async ({ id, data }) => {
      // Instantly clear search in 0ms to redirect view to main list immediately
      if (data.showInMainList) {
        setSearch("");
      }

      await queryClient.cancelQueries({ queryKey: ["customers"] });
      const targetCustomer = customers.find(c => c.id === id);

      queryClient.setQueriesData({ queryKey: ["customers"] }, (oldData: any) => {
        if (!oldData) return oldData;

        let foundInOld = false;
        const updatedData = (oldData.data || []).map((c: Customer) => {
          if (c.id === id) {
            foundInOld = true;
            return { ...c, showInMainList: data.showInMainList };
          }
          return c;
        });

        if (!foundInOld && targetCustomer && data.showInMainList) {
          updatedData.unshift({ ...targetCustomer, showInMainList: true });
        }

        return {
          ...oldData,
          data: updatedData,
          total: data.showInMainList ? (oldData.total || 0) + (foundInOld ? 0 : 1) : Math.max(0, (oldData.total || 1) - 1),
        };
      });
    },
    onSuccess: (updatedCustomer: Customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customer-identifiers"] });
      if (updatedCustomer.showInMainList) {
        toast.success(`${updatedCustomer.name} added to main customer list!`);
      } else {
        toast.info(`${updatedCustomer.name} removed from main customer list.`);
      }
    },
    onError: () => {
      toast.error("Failed to update customer preference");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  const bulkMutation = useMutation({
    mutationFn: bulkCreateCustomers,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customer-identifiers"] });
      setBulkConfirmOpen(false);
      setBulkSummaryResult({
        total: res.totalCount,
        created: res.createdCount,
        skipped: res.skippedCount,
      });
      // Automatically clear search to show main list
      setSearch("");
    },
    onError: () => {
      setBulkConfirmOpen(false);
      toast.error("Failed to import Google Contacts.");
    }
  });

  const handleBulkAddGoogleContacts = (contactsList: GoogleContact[]) => {
    if (!contactsList || contactsList.length === 0) {
      toast.info("No Google contacts found to import.");
      return;
    }
    const payload = contactsList.map(c => ({
      name: c.name,
      mobileNumber: c.email || "",
      phone: c.phone || "0000000000",
    }));
    bulkMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["all-customer-identifiers"] });
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
    createMutation.mutate({ ...formData, showInMainList: true });
  };

  const handleAddGoogleContact = (contact: GoogleContact) => {
    const contactKey = contact.email || contact.phone || contact.name;
    
    if (isContactAdded(contact)) {
      toast.error("Customer already exists.");
      return;
    }

    setAddingKey(contactKey);

    let phoneVal = contact.phone?.trim() || "";
    if (!phoneVal) {
      phoneVal = "0000000000";
    }

    createMutation.mutate({
      name: contact.name.trim(),
      mobileNumber: contact.email?.trim() || "",
      phone: phoneVal,
      showInMainList: true,
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
          <Button 
            onClick={() => {
              queryClient.resetQueries({ queryKey: ["customers"] });
              refetch();
            }} 
            variant="default"
          >
            Retry
          </Button>
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
          disabled: isGoogleDisabled,
          isLoadingContacts: isLoadingGoogleContacts,
        } = google;

        // Filter Google Contacts inside popup modal
        let filteredGoogleContacts: GoogleContact[] = googleContactsRaw || [];
        if (googleModalSearch && googleModalSearch.trim().length > 0) {
          const lowerSearch = googleModalSearch.toLowerCase().trim();
          filteredGoogleContacts = filteredGoogleContacts.filter((c: GoogleContact) => 
            c.name?.toLowerCase().includes(lowerSearch) ||
            c.email?.toLowerCase().includes(lowerSearch) ||
            c.phone?.includes(lowerSearch)
          );
        }

        const handleOpenGoogleModal = () => {
          if (!isGoogleConnected || isGoogleExpired) {
            connectGoogle();
          } else {
            google.loadContacts?.();
            setGoogleModalOpen(true);
          }
        };

        return (
          <div className="space-y-5">
            <PageHeader
              title="Customers"
              description={
                search
                  ? `${totalItems} customer${totalItems === 1 ? "" : "s"} found`
                  : `${totalItems} relevant customer${totalItems === 1 ? "" : "s"}`
              }
              breadcrumbs={[{ label: "Customers" }]}
              actions={
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Button 
                    variant="default"
                    disabled={isGoogleConnecting}
                    onClick={handleOpenGoogleModal}
                  >
                    {isGoogleConnecting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add All Contacts in One Go
                  </Button>

                  <Button id="add-customer-btn" onClick={() => { setFormData({}); setAddOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
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
                  <Button 
                    variant="outline" 
                    onClick={() => setGoogleModalOpen(true)}
                    className="text-green-600 border-green-200 bg-green-50/50 dark:bg-green-900/20 dark:border-green-900"
                  >
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

            <div>
              <p className="text-xs text-muted-foreground px-1 pb-1">
                {search ? `Search results for "${search}"` : "Only customers with invoices or explicitly added to the main list are shown here."}
              </p>
            </div>

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
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* Option to Add / Pin customer to main list so they display outside without requiring invoice */}
                          {row.totalOrders === 0 && (
                            row.showInMainList ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updateMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateMutation.mutate({ id: row.id, data: { showInMainList: false } });
                                }}
                                className="text-green-600 border-green-200 bg-green-50/50 dark:bg-green-900/20 text-xs h-8 shrink-0"
                                title="Click to remove from main customer table display"
                              >
                                <Check className="h-3 w-3 mr-1" /> On Main List
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={updateMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateMutation.mutate({ id: row.id, data: { showInMainList: true } });
                                }}
                                className="text-xs h-8 shrink-0"
                                title="Add customer to main table display"
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add to Main List
                              </Button>
                            )
                          )}

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
                      title={search ? "No customers match your search" : "No active customers"}
                      description={search ? "Try a different search term or search by phone/email." : "Customers will automatically appear here once an invoice is created or when added to main list."}
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

            {/* Google Contacts Popup Modal */}
            <Dialog open={googleModalOpen} onOpenChange={setGoogleModalOpen}>
              <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2">
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <img src="https://www.gstatic.com/images/branding/product/1x/contacts_48dp.png" alt="Google Contacts" className="w-5 h-5 rounded-full" />
                    Google Contacts
                  </DialogTitle>
                  <DialogDescription>
                    {isLoadingGoogleContacts ? (
                      "Loading contacts from Google..."
                    ) : (
                      `${filteredGoogleContacts.length} Google contacts`
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-2 border-b bg-muted/20">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={googleModalSearch}
                      onChange={(e) => setGoogleModalSearch(e.target.value)}
                      placeholder="Search Google Contacts..."
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 divide-y max-h-[380px]">
                  {isLoadingGoogleContacts ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Fetching Google Contacts...</p>
                    </div>
                  ) : filteredGoogleContacts.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      {googleModalSearch ? "No Google Contacts match your search." : "No Google Contacts found."}
                    </div>
                  ) : (
                    filteredGoogleContacts.map((contact, i) => {
                      const added = isContactAdded(contact);
                      const contactKey = contact.email || contact.phone || contact.name;
                      const isAddingThis = createMutation.isPending && addingKey === contactKey;

                      return (
                        <div key={i} className="flex items-center justify-between py-3 gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 flex-shrink-0">
                              <AvatarImage src={contact.photo || undefined} />
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {getInitials(contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">{contact.name}</p>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                                {contact.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {contact.email}
                                  </span>
                                )}
                                {contact.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {contact.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {added ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled 
                              className="text-green-600 border-green-200 bg-green-50/50 dark:bg-green-900/20 dark:border-green-900/40 shrink-0"
                            >
                              <Check className="h-3.5 w-3.5 mr-1" /> Added
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              disabled={createMutation.isPending}
                              onClick={() => handleAddGoogleContact(contact)}
                              className="shrink-0"
                            >
                              {isAddingThis ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              ) : (
                                <Plus className="h-3.5 w-3.5 mr-1" />
                              )}
                              Add Customer
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row items-center justify-between sm:justify-between">
                  <Button variant="outline" onClick={() => setGoogleModalOpen(false)}>
                    Close
                  </Button>
                  {isGoogleConnected && !isGoogleExpired && (
                    <Button 
                      disabled={bulkMutation.isPending || !googleContactsRaw || googleContactsRaw.length === 0}
                      onClick={() => setBulkConfirmOpen(true)}
                    >
                      {bulkMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add All Contacts in One Go
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Customer Modal */}
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

            {/* Bulk Import Confirmation Dialog */}
            <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Import Google Contacts?</DialogTitle>
                  <DialogDescription>
                    Your connected Google account contains approximately {googleContactsRaw?.length || 0} contacts.
                    This will add eligible Google Contacts to StockFlow Customers. Existing contacts will not be duplicated.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setBulkConfirmOpen(false)}>Cancel</Button>
                  <Button 
                    disabled={bulkMutation.isPending} 
                    onClick={() => handleBulkAddGoogleContacts(googleContactsRaw || [])}
                  >
                    {bulkMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Import All Contacts
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Bulk Import Summary Dialog */}
            <Dialog open={!!bulkSummaryResult} onOpenChange={() => setBulkSummaryResult(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Google Contacts Import Complete</DialogTitle>
                  <DialogDescription>
                    Here is the summary of your Google Contacts import into StockFlow:
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-3 border-y my-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total contacts found:</span>
                    <span className="font-semibold">{bulkSummaryResult?.total || 0}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Successfully added:</span>
                    <span>+{bulkSummaryResult?.created || 0}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Already existing / skipped:</span>
                    <span>{bulkSummaryResult?.skipped || 0}</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setBulkSummaryResult(null)}>Done</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      }}
    </GoogleProviderWrapper>
  );
}
