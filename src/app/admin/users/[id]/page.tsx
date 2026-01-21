import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import UserForm from "@/components/admin/UserForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update user &quot;{user.email}&quot;
        </p>
      </div>

      <UserForm
        initialData={{
          id: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          role: user.role,
        }}
        isEditing
      />
    </div>
  );
}
