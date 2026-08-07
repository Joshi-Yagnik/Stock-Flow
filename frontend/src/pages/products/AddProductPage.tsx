import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductForm, type ProductFormData } from "./components/ProductForm";
import { createProduct, uploadProductImage } from "@/lib/api/products";
import type { Product } from "@/types";

export default function AddProductPage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ data, file }: { data: Partial<Product>; file: File | null }) => {
      const product = await createProduct(data);
      if (file) {
        await uploadProductImage(product.id, file);
      }
      return product;
    },
    onSuccess: () => {
      toast.success("Product added successfully!");
      navigate("/products");
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      const detail = error.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((err: any) => `${err.loc.at(-1)}: ${err.msg}`).join(", ");
        toast.error(`Validation Error: ${messages}`);
      } else if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error(error.message || "Failed to add product");
      }
    },
  });

  const handleSubmit = (data: ProductFormData, file: File | null) => {
    try {
      const cleanedData = {
        ...data,
        purchasePrice: data.purchasePrice ?? null,
        gstPercentage: data.gstPercentage ?? null,
        stockQuantity: data.stockQuantity ?? null,
        minimumStock: data.minimumStock ?? null,
        sku: data.sku?.trim() || null,
        barcode: data.barcode?.trim() || null,
        brand: data.brand || null,
        description: data.description || null,
      };
      mutation.mutate({ data: cleanedData as Partial<Product>, file });
    } catch (error) {
      console.error("Unexpected error during submit:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Create a new product in your inventory."
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "Add Product" },
        ]}
      />

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <ProductForm onSubmit={handleSubmit} isLoading={mutation.isPending} />
      </div>
    </div>
  );
}
