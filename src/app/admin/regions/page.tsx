import prisma from "@/lib/db";
import Link from "next/link";
import { Plus, Edit, ChevronRight } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";

interface RegionWithChildren {
  id: string;
  name: string;
  slug: string;
  _count: { camps: number };
  children: RegionWithChildren[];
}

async function getRegions(): Promise<RegionWithChildren[]> {
  const regions = await prisma.region.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { camps: true } },
      children: {
        orderBy: { name: "asc" },
        include: {
          _count: { select: { camps: true } },
          children: {
            orderBy: { name: "asc" },
            include: {
              _count: { select: { camps: true } },
              children: {
                orderBy: { name: "asc" },
                include: {
                  _count: { select: { camps: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return regions as RegionWithChildren[];
}

function RegionRow({
  region,
  level = 0,
}: {
  region: RegionWithChildren;
  level?: number;
}) {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
            {level > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {region.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {region.slug}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {region._count.camps}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/regions/${region.id}`}
              className="text-blue-600 hover:text-blue-700"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <DeleteButton
              id={region.id}
              name={region.name}
              endpoint="/api/admin/regions"
              type="region"
            />
          </div>
        </td>
      </tr>
      {region.children?.map((child) => (
        <RegionRow key={child.id} region={child} level={level + 1} />
      ))}
    </>
  );
}

export default async function AdminRegionsPage() {
  const regions = await getRegions();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage geographical regions (hierarchical structure)
          </p>
        </div>
        <Link
          href="/admin/regions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Region
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Camps
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regions.map((region) => (
              <RegionRow key={region.id} region={region} />
            ))}
            {regions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No regions found.{" "}
                  <Link
                    href="/admin/regions/new"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
