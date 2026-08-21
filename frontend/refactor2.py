import re
import sys

file_path = r'd:\Stock-Flow\frontend\src\pages\customers\CustomersPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change default tab to google
content = content.replace('const [addTab, setAddTab] = useState("manual");', 'const [addTab, setAddTab] = useState("google");')

# 2. Add an effect to load contacts when addOpen is true
content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";')

use_effect_logic = '''
  useEffect(() => {
    if (addOpen && addTab === "google" && googleContactsRaw.length === 0 && !isLoadingGoogleContacts) {
      loadContacts();
    }
  }, [addOpen, addTab]);
'''
content = content.replace('const queryClient = useQueryClient();', 'const queryClient = useQueryClient();\n' + use_effect_logic)

# 3. Add descriptive text to Add Customer modal
content = content.replace(
    '<DialogDescription>\n                    Add a new customer to your database.\n                  </DialogDescription>',
    '<DialogDescription>\n                    Select a contact from Google Contacts or add a customer manually.\n                  </DialogDescription>'
)

# 4. Handle "This contact is already a customer."
content = content.replace(
    '<Badge variant="outline" className="text-green-600">Added</Badge>',
    '<span className="text-xs text-muted-foreground italic">This contact is already a customer.</span>'
)

# 5. Handle Error states
error_msg = '''
                      ) : isGoogleError ? (
                        <div className="py-12 text-center text-sm text-destructive">
                          Unable to access Google Contacts. Please reconnect your Google account.
                        </div>
                      ) : (
'''
content = re.sub(r'\) : isGoogleError \? \([\s\S]*?\) : \(', error_msg, content)

# 6. Ensure the order of tabs is Google Contacts first
tabs_list_old = '''<TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Add Manually</TabsTrigger>
                    <TabsTrigger value="google" onClick={() => loadContacts()}>Select from Google Contacts</TabsTrigger>
                  </TabsList>'''
tabs_list_new = '''<TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="google" onClick={() => loadContacts()}>Select from Google Contacts</TabsTrigger>
                    <TabsTrigger value="manual">Add Manually</TabsTrigger>
                  </TabsList>'''
content = content.replace(tabs_list_old, tabs_list_new)

# 7. Update empty states for search and loading
content = content.replace(
    'return <div className="py-8 text-center text-sm text-muted-foreground">No contacts found.</div>;',
    'return <div className="py-8 text-center text-sm text-muted-foreground">{googleSearch ? "No contacts match your search." : "No Google Contacts found."}</div>;'
)

# 8. Fix loading text
content = content.replace('Fetching Google Contacts...', 'Loading Google Contacts...')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
