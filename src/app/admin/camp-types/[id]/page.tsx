import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import SimpleForm from "@/components/admin/SimpleForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const campTypeFields = [
  { name: "name", label: "Name", type: "text" as const, required: true },
  { name: "slug", label: "Slug", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "textarea" as const },
  { name: "icon", label: "Icon (emoji)", type: "text" as const, placeholder: "e.g., ⛺ 🏕️ 🌲" },
];

async function getCampType(id: string) {
  return prisma.campType.findUnique({ where: { id } });
}

export default async function EditCampTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campType = await getCampType(id);

  if (!campType) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/camp-types"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Camp Types
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Camp Type</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update camp type &quot;{campType.name}&quot;
        </p>
      </div>

      <SimpleForm
        fields={campTypeFields}
        initialData={{
          name: campType.name,
          slug: campType.slug,
          description: campType.description,
          icon: campType.icon,
        }}
        endpoint="/api/admin/camp-types"
        entityId={campType.id}
        isEditing
        backUrl="/admin/camp-types"
        submitLabel="Update Camp Type"
      />
    </div>
  );
}
