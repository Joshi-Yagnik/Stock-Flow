import { useState } from "react";
import { Trash2, Receipt, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { products, customers } from "@/data/dummy";
import { formatCurrency, generateInvoiceNumber } from "@/lib/utils";
import { toast } from "sonner";

interface BillingItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  discount: number;
}

export default function BillingPage() {
  const [items, setItems] = useState<BillingItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [taxRate] = useState(18);
  const [invoiceNo] = useState(generateInvoiceNumber());

  const filteredProducts = products.filter(
    (p) =>
      p.isActive &&
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku ?? "").toLowerCase().includes(productSearch.toLowerCase()))
  );

  const addItem = (product: (typeof products)[0]) => {
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          qty: 1,
          unitPrice: product.sellingPrice,
          discount: 0,
        },
      ]);
    }
    setProductSearch("");
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, field: keyof BillingItem, value: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );

  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.qty * (1 - i.discount / 100),
    0
  );
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="space-y-5">
      <PageHeader
        title="New Invoice"
        description={`Invoice #${invoiceNo}`}
        breadcrumbs={[{ label: "Billing" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Saved as draft!")}>
              Save Draft
            </Button>
            <Button
              onClick={() => {
                if (!selectedCustomer) {
                  toast.error("Please select a customer first.");
                  return;
                }
                if (items.length === 0) {
                  toast.error("Please add at least one product.");
                  return;
                }
                toast.success(`Invoice ${invoiceNo} created successfully!`);
              }}
            >
              <Receipt className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Products & Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="billing-product-search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU…"
                  className="pl-9"
                />
              </div>

              {productSearch && (
                <div className="rounded-xl border border-border bg-popover shadow-elevated overflow-hidden max-h-56 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No products found
                    </p>
                  ) : (
                    filteredProducts.slice(0, 6).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addItem(product)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-accent transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {product.sku}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-semibold text-primary">
                            {formatCurrency(product.sellingPrice)}
                          </p>
                          <Badge
                            variant={
                              (product.stockQuantity ?? 0) > (product.minimumStock ?? 10)
                                ? "success"
                                : "destructive"
                            }
                            className="text-[10px]"
                          >
                            stockQuantity: {product.stockQuantity}
                          </Badge>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Invoice Items{" "}
                {items.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {items.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    No items added yet. Search for products above.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {["Product", "Qty", "Unit Price", "Disc%", "Total", ""].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item) => {
                        const lineTotal =
                          item.unitPrice *
                          item.qty *
                          (1 - item.discount / 100);
                        return (
                          <tr key={item.id} className="hover:bg-muted/20">
                            <td className="px-4 py-3 text-sm font-medium max-w-[200px]">
                              <p className="truncate">{item.productName}</p>
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={(e) =>
                                  updateItem(
                                    item.id,
                                    "qty",
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                }
                                className="w-20 h-8 text-center"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={item.discount}
                                onChange={(e) =>
                                  updateItem(
                                    item.id,
                                    "discount",
                                    Math.min(100, parseFloat(e.target.value) || 0)
                                  )
                                }
                                className="w-20 h-8 text-center"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">
                              {formatCurrency(lineTotal)}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="billing-customer">Select Customer *</Label>
                <select
                  id="billing-customer"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="flex h-9 w-full items-center rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Select customer --</option>
                  {customers
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="billing-due">Due Date</Label>
                <Input id="billing-due" type="date" defaultValue={
                  new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0]
                } />
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <Button
                className="w-full mt-2"
                size="lg"
                onClick={() => {
                  if (!selectedCustomer) {
                    toast.error("Please select a customer first.");
                    return;
                  }
                  if (items.length === 0) {
                    toast.error("Please add at least one product.");
                    return;
                  }
                  toast.success(`Invoice ${invoiceNo} created!`);
                }}
              >
                Create Invoice
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                id="billing-notes"
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Payment terms, delivery notes…"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
