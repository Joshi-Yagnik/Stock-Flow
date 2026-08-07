import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UploadCloud } from "lucide-react";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(0, "Must be a positive number").optional()
);

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().optional().or(z.literal("")),
  barcode: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  purchasePrice: optionalNumber,
  sellingPrice: z.coerce.number().min(0, "Must be a positive number"),
  gstPercentage: optionalNumber,
  stockQuantity: optionalNumber,
  minimumStock: optionalNumber,
  unit: z.string().min(1, "Unit is required"),
  brand: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: ProductFormData, imageFile: File | null) => void;
  isLoading?: boolean;
}

const UNITS = ["pcs", "kg", "g", "l", "ml", "box", "pack", "pair", "dozen"];

export function ProductForm({ initialData, onSubmit, isLoading = false }: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      barcode: initialData?.barcode || "",
      categoryId: initialData?.categoryId || "",
      purchasePrice: initialData?.purchasePrice ?? ("" as any),
      sellingPrice: initialData?.sellingPrice ?? ("" as any),
      gstPercentage: initialData?.gstPercentage ?? ("" as any),
      stockQuantity: initialData?.stockQuantity ?? ("" as any),
      minimumStock: initialData?.minimumStock ?? ("" as any),
      unit: initialData?.unit || "",
      brand: initialData?.brand || "",
      description: initialData?.description || "",
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, selectedFile))} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column (Image) */}
        <div className="col-span-1 space-y-4">
          <Label>Product Image</Label>
          <div className="border-2 border-dashed border-border rounded-xl h-64 flex flex-col items-center justify-center bg-card text-muted-foreground hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden relative group">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm font-medium">Change Image</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <UploadCloud className="h-10 w-10 mb-2 text-muted-foreground/60" />
                <p className="text-sm font-medium text-foreground">Upload Image</p>
                <p className="text-xs mt-1">SVG, PNG, JPG (max 2MB)</p>
              </div>
            )}
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>
        </div>

        {/* Right Columns (Fields) */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" {...register("name")} placeholder="Enter product name" />
              {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} placeholder="Enter SKU (optional)" />
              {errors.sku && <p className="text-[10px] text-destructive">{errors.sku.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" {...register("barcode")} placeholder="Enter barcode (optional)" />
              {errors.barcode && <p className="text-[10px] text-destructive">{errors.barcode.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" {...register("brand")} placeholder="Enter brand" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Category *</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-[10px] text-destructive">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div className="h-px bg-border my-4" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input id="purchasePrice" type="number" step="0.01" {...register("purchasePrice")} />
              {errors.purchasePrice && <p className="text-[10px] text-destructive">{errors.purchasePrice.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sellingPrice">Selling Price *</Label>
              <Input id="sellingPrice" type="number" step="0.01" {...register("sellingPrice")} />
              {errors.sellingPrice && <p className="text-[10px] text-destructive">{errors.sellingPrice.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gstPercentage">GST %</Label>
              <Input id="gstPercentage" type="number" step="0.1" {...register("gstPercentage")} />
              {errors.gstPercentage && <p className="text-[10px] text-destructive">{errors.gstPercentage.message}</p>}
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stockQuantity">Current Stock</Label>
              <Input id="stockQuantity" type="number" {...register("stockQuantity")} />
              {errors.stockQuantity && <p className="text-[10px] text-destructive">{errors.stockQuantity.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minimumStock">Min Stock</Label>
              <Input id="minimumStock" type="number" {...register("minimumStock")} />
              {errors.minimumStock && <p className="text-[10px] text-destructive">{errors.minimumStock.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => (
                        <SelectItem key={u} value={u}>{u.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit && <p className="text-[10px] text-destructive">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...register("description")} 
              placeholder="Enter product description" 
              className="resize-none h-24"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData?.name ? "Update Product" : "Save Product"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
