import prisma from "@/lib/db";
import CampForm from "@/components/admin/CampForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getFormData() {
  const [campTypes, categories, regions] = await Promise.all([
    prisma.campType.findMany({ orderBy: { name: "asc" } }),
    prisma.campCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.region.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { campTypes, categories, regions };
}

export default async function NewCampPage() {
  const { campTypes, categories, regions } = await getFormData();

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
        <h1 className="text-2xl font-bold text-gray-900">Add New Camp</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new camp listing
        </p>
      </div>

      <CampForm
        campTypes={campTypes}
        categories={categories}
        regions={regions}
      />
    </div>
  );
}
