import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { Building2, Bell, Shield, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [invoiceReminder, setInvoiceReminder] = useState(true);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Manage your application preferences and business configuration"
        breadcrumbs={[{ label: "Settings" }]}
      />

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" /> Company
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="billing-config" className="gap-2">
            <Globe className="h-4 w-4" /> Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                This information appears on your invoices and reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input id="company-name" defaultValue="StockFlow Wholesale" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-email">Email *</Label>
                  <Input id="company-email" type="email" defaultValue="admin@stockflow.app" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input id="company-phone" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-gst">GST Number</Label>
                  <Input id="company-gst" placeholder="29AADCS1234F1Z5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-address">Business Address</Label>
                <Textarea
                  id="company-address"
                  placeholder="Street, City, State, PIN"
                  defaultValue="45 Commercial Street, Bengaluru, Karnataka – 560001"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-logo">Company Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    S
                  </div>
                  <Button variant="outline" size="sm">
                    Upload Logo
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Company settings saved!")}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how StockFlow looks for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        theme === t
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/40"
                      }`}
                    >
                      <div
                        className={`h-10 rounded-lg mb-2 ${
                          t === "light"
                            ? "bg-white border border-border"
                            : t === "dark"
                            ? "bg-zinc-900"
                            : "bg-gradient-to-r from-white to-zinc-900"
                        }`}
                      />
                      <p className="text-sm font-medium capitalize">{t}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Appearance saved!")}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control which alerts you receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                {
                  id: "email-notif",
                  label: "Email Notifications",
                  desc: "Receive notifications via email",
                  value: emailNotif,
                  set: setEmailNotif,
                },
                {
                  id: "low-stock",
                  label: "Low Stock Alerts",
                  desc: "Get notified when products reach minimum stock level",
                  value: lowStockAlert,
                  set: setLowStockAlert,
                },
                {
                  id: "invoice-reminder",
                  label: "Invoice Reminders",
                  desc: "Send reminders for overdue invoices",
                  value: invoiceReminder,
                  set: setInvoiceReminder,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={item.id} className="text-base cursor-pointer">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={item.value}
                    onCheckedChange={item.set}
                  />
                </div>
              ))}
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Notification preferences saved!")}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Config Tab */}
        <TabsContent value="billing-config">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
              <CardDescription>Configure invoice and tax settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input id="invoice-prefix" defaultValue="INV" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="INR (₹)" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                  <Input id="tax-rate" type="number" defaultValue="18" min={0} max={100} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                  <Input id="low-stock-threshold" type="number" defaultValue="10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invoice-footer">Invoice Footer Note</Label>
                <Textarea
                  id="invoice-footer"
                  placeholder="e.g. Thank you for your business!"
                  defaultValue="Thank you for your business! Payment due within 15 days."
                  rows={3}
                />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Billing settings saved!")}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="Min 8 characters" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="Re-enter new password" />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button
                  onClick={() => toast.success("Password updated successfully!")}
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
