import prisma from "@/lib/db";
import Link from "next/link";
import {
  Tent,
  Tags,
  FolderTree,
  MapPin,
  Users,
  FileText,
  Calendar,
  Star,
} from "lucide-react";

async function getStats() {
  const [
    totalCamps,
    activeCamps,
    totalCampTypes,
    totalCategories,
    totalRegions,
    totalUsers,
    totalPages,
    totalSessions,
    totalReviews,
  ] = await Promise.all([
    prisma.camp.count(),
    prisma.camp.count({ where: { published: true } }),
    prisma.campType.count(),
    prisma.campCategory.count(),
    prisma.region.count(),
    prisma.user.count(),
    prisma.page.count(),
    prisma.campSession.count(),
    prisma.review.count(),
  ]);

  return {
    totalCamps,
    activeCamps,
    totalCampTypes,
    totalCategories,
    totalRegions,
    totalUsers,
    totalPages,
    totalSessions,
    totalReviews,
  };
}

async function getRecentCamps() {
  return prisma.camp.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      campType: true,
      region: true,
    },
  });
}

export default async function AdminDashboard() {
  const [stats, recentCamps] = await Promise.all([
    getStats(),
    getRecentCamps(),
  ]);

  const statCards = [
    {
      name: "Total Camps",
      value: stats.totalCamps,
      subtext: `${stats.activeCamps} active`,
      icon: Tent,
      href: "/admin/camps",
      color: "bg-blue-500",
    },
    {
      name: "Camp Types",
      value: stats.totalCampTypes,
      icon: Tags,
      href: "/admin/camp-types",
      color: "bg-purple-500",
    },
    {
      name: "Categories",
      value: stats.totalCategories,
      icon: FolderTree,
      href: "/admin/categories",
      color: "bg-green-500",
    },
    {
      name: "Regions",
      value: stats.totalRegions,
      icon: MapPin,
      href: "/admin/regions",
      color: "bg-orange-500",
    },
    {
      name: "Users",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      color: "bg-pink-500",
    },
    {
      name: "Pages",
      value: stats.totalPages,
      icon: FileText,
      href: "/admin/pages",
      color: "bg-indigo-500",
    },
    {
      name: "Sessions",
      value: stats.totalSessions,
      icon: Calendar,
      href: "/admin/camps",
      color: "bg-teal-500",
    },
    {
      name: "Reviews",
      value: stats.totalReviews,
      icon: Star,
      href: "/admin/camps",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to CamListing Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                {stat.subtext && (
                  <p className="text-xs text-gray-400">{stat.subtext}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Camps */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Camps</h2>
          <Link
            href="/admin/camps"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Camp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCamps.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/camps/${camp.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {camp.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {camp.campType.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {camp.region.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        camp.published
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {camp.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(camp.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentCamps.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No camps yet.{" "}
                    <Link
                      href="/admin/camps/new"
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

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/camps/new"
            className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            <Tent className="h-5 w-5" />
            <span className="font-medium">Add New Camp</span>
          </Link>
          <Link
            href="/admin/categories/new"
            className="flex items-center gap-3 rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 transition-colors"
          >
            <FolderTree className="h-5 w-5" />
            <span className="font-medium">Add Category</span>
          </Link>
          <Link
            href="/admin/regions/new"
            className="flex items-center gap-3 rounded-lg bg-orange-600 px-4 py-3 text-white hover:bg-orange-700 transition-colors"
          >
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Add Region</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-lg bg-purple-600 px-4 py-3 text-white hover:bg-purple-700 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span className="font-medium">Manage Users</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
