import UserForm from "@/components/admin/UserForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewUserPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
        <p className="mt-1 text-sm text-gray-600">Create a new user account</p>
      </div>

      <UserForm />
    </div>
  );
}
