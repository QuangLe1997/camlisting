import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import SimpleForm from "@/components/admin/SimpleForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const categoryFields = [
  { name: "name", label: "Name", type: "text" as const, required: true },
  { name: "slug", label: "Slug", type: "text" as const, required: true },
];

async function getCategory(id: string) {
  return prisma.campCategory.findUnique({ where: { id } });
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update category &quot;{category.name}&quot;
        </p>
      </div>

      <SimpleForm
        fields={categoryFields}
        initialData={{
          name: category.name,
          slug: category.slug,
        }}
        endpoint="/api/admin/categories"
        entityId={category.id}
        isEditing
        backUrl="/admin/categories"
        submitLabel="Update Category"
      />
    </div>
  );
}
