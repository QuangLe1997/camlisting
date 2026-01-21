import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import RegionForm from "@/components/admin/RegionForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getRegion(id: string) {
  return prisma.region.findUnique({ where: { id } });
}

async function getRegionsHierarchy() {
  const regions = await prisma.region.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: {
      children: {
        orderBy: { name: "asc" },
        include: {
          children: {
            orderBy: { name: "asc" },
            include: {
              children: {
                orderBy: { name: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return regions;
}

export default async function EditRegionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [region, regions] = await Promise.all([
    getRegion(id),
    getRegionsHierarchy(),
  ]);

  if (!region) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/regions"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Regions
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Region</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update region &quot;{region.name}&quot;
        </p>
      </div>

      <RegionForm
        initialData={{
          id: region.id,
          name: region.name,
          slug: region.slug,
          description: region.description || "",
          image: region.image || "",
          parentId: region.parentId || "",
        }}
        regions={regions}
        isEditing
      />
    </div>
  );
}
