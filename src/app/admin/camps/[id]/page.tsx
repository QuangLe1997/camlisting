import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import CampForm from "@/components/admin/CampForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getCamp(id: string) {
  const camp = await prisma.camp.findUnique({
    where: { id },
    include: {
      categories: { select: { categoryId: true } },
    },
  });

  if (!camp) return null;

  return {
    ...camp,
    categoryIds: camp.categories.map((c) => c.categoryId),
  };
}

async function getFormData() {
  const [campTypes, categories, regions] = await Promise.all([
    prisma.campType.findMany({ orderBy: { name: "asc" } }),
    prisma.campCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.region.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { campTypes, categories, regions };
}

export default async function EditCampPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [camp, { campTypes, categories, regions }] = await Promise.all([
    getCamp(id),
    getFormData(),
  ]);

  if (!camp) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/camps"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Camps
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Camp</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update camp details for &quot;{camp.name}&quot;
        </p>
      </div>

      <CampForm
        initialData={{
          id: camp.id,
          name: camp.name,
          slug: camp.slug,
          description: camp.description || "",
          shortDescription: camp.shortDescription || "",
          address: camp.address || "",
          city: camp.city || "",
          country: camp.country || "",
          latitude: camp.latitude,
          longitude: camp.longitude,
          coverImage: camp.coverImage || "",
          logo: camp.logo || "",
          videoUrl: camp.videoUrl || "",
          ageMin: camp.ageMin,
          ageMax: camp.ageMax,
          published: camp.published,
          featured: camp.featured,
          campTypeId: camp.campTypeId,
          regionId: camp.regionId,
          categoryIds: camp.categoryIds,
          email: camp.email || "",
          phone: camp.phone || "",
          website: camp.website || "",
        }}
        campTypes={campTypes}
        categories={categories}
        regions={regions}
        isEditing
      />
    </div>
  );
}
