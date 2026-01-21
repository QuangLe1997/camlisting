import { Suspense } from "react";
import Link from "next/link";
import { Filter, X } from "lucide-react";
import { getCamps, getCampTypes, getRegions } from "@/lib/data";
import CampCard from "@/components/camps/CampCard";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    region?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Browse Camps",
  description: "Explore our collection of summer camps, language programs, and educational experiences worldwide.",
};

async function CampFilters({
  activeType,
  activeRegion,
  search,
}: {
  activeType?: string;
  activeRegion?: string;
  search?: string;
}) {
  const [campTypes, regions] = await Promise.all([getCampTypes(), getRegions()]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-gray-500" />
        <h2 className="font-semibold text-gray-900">Filters</h2>
      </div>

      {/* Active Filters */}
      {(activeType || activeRegion || search) && (
        <div className="mb-6 pb-6 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {search && (
              <Link
                href={`/camps?${activeType ? `type=${activeType}&` : ""}${activeRegion ? `region=${activeRegion}` : ""}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm hover:bg-blue-100"
              >
                Search: {search}
                <X className="h-3.5 w-3.5" />
              </Link>
            )}
            {activeType && (
              <Link
                href={`/camps?${search ? `search=${search}&` : ""}${activeRegion ? `region=${activeRegion}` : ""}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm hover:bg-blue-100"
              >
                {campTypes.find((t) => t.slug === activeType)?.name || activeType}
                <X className="h-3.5 w-3.5" />
              </Link>
            )}
            {activeRegion && (
              <Link
                href={`/camps?${search ? `search=${search}&` : ""}${activeType ? `type=${activeType}` : ""}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm hover:bg-blue-100"
              >
                {regions
                  .flatMap((r) => [r, ...r.children.flatMap((c) => [c, ...c.children])])
                  .find((r) => r.slug === activeRegion)?.name || activeRegion}
                <X className="h-3.5 w-3.5" />
              </Link>
            )}
            <Link
              href="/camps"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
            >
              Clear all
            </Link>
          </div>
        </div>
      )}

      {/* Camp Types */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Camp Type</h3>
        <div className="space-y-2">
          {campTypes.map((type) => {
            const isActive = activeType === type.slug;
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (!isActive) params.set("type", type.slug);
            if (activeRegion) params.set("region", activeRegion);

            return (
              <Link
                key={type.id}
                href={`/camps${params.toString() ? `?${params.toString()}` : ""}`}
                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="text-sm">{type.name}</span>
                <span className="text-xs text-gray-500">{type._count.camps}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Regions */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Destination</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {regions.map((region) => (
            <div key={region.id}>
              <RegionLink
                region={region}
                activeRegion={activeRegion}
                search={search}
                activeType={activeType}
                level={0}
              />
              {region.children.map((child) => (
                <div key={child.id}>
                  <RegionLink
                    region={child}
                    activeRegion={activeRegion}
                    search={search}
                    activeType={activeType}
                    level={1}
                  />
                  {child.children.map((grandchild) => (
                    <RegionLink
                      key={grandchild.id}
                      region={grandchild}
                      activeRegion={activeRegion}
                      search={search}
                      activeType={activeType}
                      level={2}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegionLink({
  region,
  activeRegion,
  search,
  activeType,
  level,
}: {
  region: { id: string; name: string; slug: string; _count?: { camps: number } };
  activeRegion?: string;
  search?: string;
  activeType?: string;
  level: number;
}) {
  const isActive = activeRegion === region.slug;
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (activeType) params.set("type", activeType);
  if (!isActive) params.set("region", region.slug);

  return (
    <Link
      href={`/camps${params.toString() ? `?${params.toString()}` : ""}`}
      className={`flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors text-sm ${
        isActive ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
      }`}
      style={{ paddingLeft: `${(level + 1) * 12}px` }}
    >
      <span>{region.name}</span>
      {region._count && (
        <span className="text-xs text-gray-500">{region._count.camps}</span>
      )}
    </Link>
  );
}

function CampsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function CampsList({
  search,
  type,
  region,
  page,
}: {
  search?: string;
  type?: string;
  region?: string;
  page: number;
}) {
  const { camps, total, totalPages } = await getCamps({
    search,
    campTypeSlug: type,
    regionSlug: region,
    page,
    limit: 12,
  });

  if (camps.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-4xl mb-4">🏕️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No camps found</h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your filters or search query.
        </p>
        <Link
          href="/camps"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">
          Showing {camps.length} of {total} camps
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {camps.map((camp) => (
          <CampCard key={camp.id} camp={camp} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/camps?${new URLSearchParams({
                ...(search && { search }),
                ...(type && { type }),
                ...(region && { region }),
                page: String(page - 1),
              }).toString()}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/camps?${new URLSearchParams({
                ...(search && { search }),
                ...(type && { type }),
                ...(region && { region }),
                page: String(page + 1),
              }).toString()}`}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default async function CampsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Camps</h1>
          <p className="mt-2 text-gray-600">
            Find the perfect camp experience from our curated collection
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <Suspense fallback={<div className="bg-white rounded-xl p-6 animate-pulse h-96" />}>
              <CampFilters
                activeType={params.type}
                activeRegion={params.region}
                search={params.search}
              />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Suspense fallback={<CampsListSkeleton />}>
              <CampsList
                search={params.search}
                type={params.type}
                region={params.region}
                page={page}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
