import prisma from "@/lib/db";
import RegionForm from "@/components/admin/RegionForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export default async function NewRegionPage() {
  const regions = await getRegionsHierarchy();

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
        <h1 className="text-2xl font-bold text-gray-900">Add New Region</h1>
        <p className="mt-1 text-sm text-gray-600">Create a new geographical region</p>
      </div>

      <RegionForm regions={regions} />
    </div>
  );
}
