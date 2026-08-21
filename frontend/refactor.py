import sys
import re

file_path = r'd:\Stock-Flow\frontend\src\pages\customers\CustomersPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import { useGoogleContacts, GoogleContact } from "@/hooks/useGoogleContacts";\nimport { GoogleOAuthProvider } from "@react-oauth/google";',
    'import { useGoogleContacts, GoogleContact } from "@/hooks/useGoogleContacts";\nimport { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";'
)

# 2. Remove wrapper logic
content = re.sub(r'const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;.*?function GoogleHookWrapper.*?return <>{children\(\{ \.\.\.google, disabled: false \}\)}</>;\n}', '', content, flags=re.DOTALL)

# 3. State replacements
content = content.replace(
    'const [googleModalOpen, setGoogleModalOpen] = useState(false);\n  const [googleModalSearch, setGoogleModalSearch] = useState("");\n\n  const [addingKey, setAddingKey] = useState<string | null>(null);\n  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);\n  const [bulkSummaryResult, setBulkSummaryResult] = useState<{ total: number; created: number; skipped: number } | null>(null);',
    'const [addingKey, setAddingKey] = useState<string | null>(null);\n  const [googleSearch, setGoogleSearch] = useState("");\n  const { contacts: googleContactsRaw, isLoadingContacts: isLoadingGoogleContacts, loadContacts, isError: isGoogleError } = useGoogleContacts();\n  const [addTab, setAddTab] = useState("manual");'
)

# 4. Remove bulkMutation & handleBulkAddGoogleContacts
content = re.sub(r'  const bulkMutation = useMutation\(\{.*?handleBulkAddGoogleContacts.*?bulkMutation\.mutate\(payload\);\n  \};\n', '', content, flags=re.DOTALL)

# 5. Remove GoogleProviderWrapper return wrapper
content = re.sub(r'return \(\n    <GoogleProviderWrapper>\n      \{\(google\) => \{\n.*?const handleOpenGoogleModal = \(\) => \{.*?\};\n\n        return \(\n          <div className="space-y-5">', 'return (\n    <div className="space-y-5">', content, flags=re.DOTALL)

# 6. Remove bulk Add button in header
content = re.sub(r'                  <Button \n                    variant="default"\n                    disabled=\{isGoogleConnecting\}\n                    onClick=\{handleOpenGoogleModal\}\n                  >\n                    \{isGoogleConnecting \? \(\n                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />\n                    \) : \(\n                      <Plus className="h-4 w-4 mr-2" />\n                    \)\}\n                    Add All Contacts in One Go\n                  </Button>', '', content, flags=re.DOTALL)

# 7. Remove Google Connect area
content = re.sub(r'              <div>\n                \{isGoogleDisabled \? \(.*?</div>', '              <div></div>', content, flags=re.DOTALL)
content = re.sub(r'            \{isGoogleExpired && \(.*?</div>\n            \)\}', '', content, flags=re.DOTALL)

# 8. Remove the closing tags for GoogleProviderWrapper
content = content.replace('          </div>\n        );\n      }}\n    </GoogleProviderWrapper>\n  );\n}', '    </div>\n  );\n}')

# 9. Modify the Add Customer Modal
# We will use regex to find the DialogContent of addOpen and wrap it in Tabs
# But it's easier to just do it via standard text replace or write a new snippet for it.
add_modal_new = '''
            {/* Add Customer Modal */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Customer</DialogTitle>
                  <DialogDescription>
                    Add a new customer to your database.
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={addTab} onValueChange={setAddTab} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Add Manually</TabsTrigger>
                    <TabsTrigger value="google" onClick={() => loadContacts()}>Select from Google Contacts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4 mt-4">
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
                  </TabsContent>

                  <TabsContent value="google" className="space-y-4 mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={googleSearch}
                        onChange={(e) => setGoogleSearch(e.target.value)}
                        placeholder="Search Google Contacts..."
                        className="pl-9 bg-background"
                      />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto divide-y max-h-[300px] border rounded-md p-1">
                      {isLoadingGoogleContacts ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Fetching Google Contacts...</p>
                        </div>
                      ) : isGoogleError ? (
                        <div className="py-12 text-center text-sm text-destructive">
                          Failed to load Google Contacts. You may need to sign out and sign back in to refresh permissions.
                        </div>
                      ) : (
                        (() => {
                          const filteredContacts = (googleContactsRaw || []).filter(c => 
                            c.name?.toLowerCase().includes(googleSearch.toLowerCase().trim()) ||
                            c.email?.toLowerCase().includes(googleSearch.toLowerCase().trim()) ||
                            c.phone?.includes(googleSearch.toLowerCase().trim())
                          );

                          if (filteredContacts.length === 0) {
                            return <div className="py-8 text-center text-sm text-muted-foreground">No contacts found.</div>;
                          }

                          return filteredContacts.map((contact, i) => {
                            const added = isContactAdded(contact);
                            return (
                              <div key={i} className="flex items-center justify-between p-2 gap-3 hover:bg-muted/50 rounded-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={contact.photo || undefined} />
                                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                      {getInitials(contact.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm text-foreground truncate">{contact.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                                      {contact.email && <span>{contact.email}</span>}
                                      {contact.phone && <span>{contact.phone}</span>}
                                    </div>
                                  </div>
                                </div>
                                {added ? (
                                  <Badge variant="outline" className="text-green-600">Added</Badge>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="h-7 text-xs"
                                    onClick={() => {
                                      setFormData({
                                        name: contact.name,
                                        mobileNumber: contact.email || "",
                                        phone: contact.phone || "",
                                      });
                                      setAddTab("manual");
                                    }}
                                  >
                                    Select
                                  </Button>
                                )}
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
'''

content = re.sub(r'\{\/\* Add Customer Modal \*\/\}[\s\S]*?<\/Dialog>', add_modal_new, content)

# 10. Remove Google Contacts Popup Modal, Bulk Import Confirmation Dialog, Bulk Import Summary Dialog entirely
content = re.sub(r'\{\/\* Google Contacts Popup Modal \*\/\}[\s\S]*?<\/Dialog>', '', content)
content = re.sub(r'\{\/\* Bulk Import Confirmation Dialog \*\/\}[\s\S]*?<\/Dialog>', '', content)
content = re.sub(r'\{\/\* Bulk Import Summary Dialog \*\/\}[\s\S]*?<\/Dialog>', '', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done python script')
