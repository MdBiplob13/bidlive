"use client";
import SiteShell from "@/components/layout/SiteShell";
import CategoryGrid from "@/components/home/CategoryGrid";
import { SAMPLE_CATEGORIES } from "@/lib/sampleData";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function CategoriesPage() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.data.categories,
  });
  const categories = data?.length ? data : SAMPLE_CATEGORIES;

  return (
    <SiteShell>
      <div className="py-8">
        <CategoryGrid categories={categories} />
      </div>
    </SiteShell>
  );
}
