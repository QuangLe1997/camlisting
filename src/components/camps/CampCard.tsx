import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Star, Users } from "lucide-react";
import type { CampWithRelations } from "@/types";

interface CampCardProps {
  camp: CampWithRelations;
}

export default function CampCard({ camp }: CampCardProps) {
  const averageRating =
    camp.reviews.length > 0
      ? camp.reviews.reduce((sum, r) => sum + r.rating, 0) / camp.reviews.length
      : 0;

  const lowestPrice =
    camp.sessions.length > 0
      ? Math.min(...camp.sessions.map((s) => s.price))
      : null;

  const nextSession = camp.sessions
    .filter((s) => new Date(s.startDate) > new Date())
    .sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0];

  return (
    <Link href={`/camps/${camp.slug}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {camp.coverImage ? (
            <Image
              src={camp.coverImage}
              alt={camp.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <span className="text-4xl">🏕️</span>
            </div>
          )}

          {/* Featured badge */}
          {camp.featured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
                Featured
              </span>
            </div>
          )}

          {/* Camp type badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
              {camp.campType.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {camp.name}
            </h3>
            {averageRating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {camp.city && `${camp.city}, `}
              {camp.region.name}
            </span>
          </div>

          {/* Age range */}
          {(camp.ageMin || camp.ageMax) && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <Users className="h-4 w-4 shrink-0" />
              <span>
                Ages {camp.ageMin || 0} - {camp.ageMax || 18}
              </span>
            </div>
          )}

          {/* Next session */}
          {nextSession && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {new Date(nextSession.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                {" - "}
                {new Date(nextSession.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="pt-3 border-t border-gray-100">
            {lowestPrice !== null ? (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {camp.sessions[0]?.currency === "EUR" ? "€" : "$"}
                  {lowestPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">starting from</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Contact for pricing</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
