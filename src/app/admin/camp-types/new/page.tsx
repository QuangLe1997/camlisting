import SimpleForm from "@/components/admin/SimpleForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const campTypeFields = [
  { name: "name", label: "Name", type: "text" as const, required: true },
  { name: "slug", label: "Slug", type: "text" as const, required: true },
  { name: "description", label: "Description", type: "textarea" as const },
  { name: "icon", label: "Icon (emoji)", type: "text" as const, placeholder: "e.g., ⛺ 🏕️ 🌲" },
];

export default function NewCampTypePage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Add New Camp Type</h1>
        <p className="mt-1 text-sm text-gray-600">Create a new camp type</p>
      </div>

      <SimpleForm
        fields={campTypeFields}
        endpoint="/api/admin/camp-types"
        backUrl="/admin/camp-types"
        submitLabel="Create Camp Type"
      />
    </div>
  );
}
