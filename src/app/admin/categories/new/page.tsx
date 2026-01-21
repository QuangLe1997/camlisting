import SimpleForm from "@/components/admin/SimpleForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const categoryFields = [
  { name: "name", label: "Name", type: "text" as const, required: true },
  { name: "slug", label: "Slug", type: "text" as const, required: true },
];

export default function NewCategoryPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
        <p className="mt-1 text-sm text-gray-600">Create a new camp category</p>
      </div>

      <SimpleForm
        fields={categoryFields}
        endpoint="/api/admin/categories"
        backUrl="/admin/categories"
        submitLabel="Create Category"
      />
    </div>
  );
}
