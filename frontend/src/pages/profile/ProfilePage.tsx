import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, FileText, Users, TrendingUp } from "lucide-react";
import { invoices } from "@/data/dummy";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceStatusBadge } from "@/components/shared/InvoiceStatusBadge";

export default function ProfilePage() {
  const [name, setName] = useState("Mukti Patel");
  const [email, setEmail] = useState("mukti@stockflow.app");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [bio, setBio] = useState("Administrator at StockFlow. Managing wholesale operations since 2024.");

  const activityStats = [
    { label: "Invoices Created", value: "128", icon: FileText, color: "text-primary" },
    { label: "Customers Added", value: "42", icon: Users, color: "text-emerald-600" },
    { label: "Total Billed", value: formatCurrency(4_200_000), icon: TrendingUp, color: "text-violet-600" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and activity"
        breadcrumbs={[{ label: "Profile" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={name} />
                <AvatarFallback className="text-2xl font-bold">MP</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
            <Badge variant="info" className="mt-2">Administrator</Badge>
            <Separator className="my-4 w-full" />
            <p className="text-sm text-muted-foreground text-left w-full leading-relaxed">
              {bio}
            </p>
            <Separator className="my-4 w-full" />
            <div className="w-full space-y-3">
              {activityStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-semibold">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-name">Full Name</Label>
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-email">Email Address</Label>
                      <Input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-phone">Phone</Label>
                      <Input
                        id="profile-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="profile-role">Role</Label>
                      <Input id="profile-role" value="Administrator" readOnly className="opacity-60 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-bio">Bio</Label>
                    <Textarea
                      id="profile-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button onClick={() => toast.success("Profile updated successfully!")}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices Created</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {inv.customerName} · {formatDate(inv.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">{formatCurrency(inv.total)}</span>
                          <InvoiceStatusBadge status={inv.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
