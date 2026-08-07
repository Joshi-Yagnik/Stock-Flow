import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductForm, type ProductFormData } from "./components/ProductForm";
import { getProduct, updateProduct, uploadProductImage } from "@/lib/api/products";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: product, isLoading: isFetching, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async ({ data, file }: { data: Partial<Product>; file: File | null }) => {
      const product = await updateProduct(id!, data);
      if (file) {
        await uploadProductImage(id!, file);
      }
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Product updated successfully!");
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
        toast.error(error.message || "Failed to update product");
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

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !product) {
    toast.error("Product not found");
    navigate("/products");
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Product"
        description={`Editing details for ${product.name}`}
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "Edit Product" },
        ]}
      />

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <ProductForm 
          initialData={product} 
          onSubmit={handleSubmit} 
          isLoading={mutation.isPending} 
        />
      </div>
    </div>
  );
}
