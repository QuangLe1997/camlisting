import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Check,
  ChevronRight,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { getCampBySlug, getRelatedCamps } from "@/lib/data";
import CampCard from "@/components/camps/CampCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const camp = await getCampBySlug(slug);

  if (!camp) {
    return { title: "Camp Not Found" };
  }

  return {
    title: camp.name,
    description: camp.shortDescription || camp.description?.substring(0, 160),
  };
}

export default async function CampDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const camp = await getCampBySlug(slug);

  if (!camp) {
    notFound();
  }

  const relatedCamps = await getRelatedCamps(
    camp.id,
    camp.regionId,
    camp.campTypeId,
    4
  );

  const averageRating =
    camp.reviews.length > 0
      ? camp.reviews.reduce((sum, r) => sum + r.rating, 0) / camp.reviews.length
      : 0;

  const upcomingSessions = camp.sessions.filter(
    (s) => new Date(s.startDate) > new Date()
  );

  return (
    <div className="bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link href="/camps" className="text-gray-500 hover:text-gray-700">
              Camps
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link
              href={`/camps?region=${camp.region.slug}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {camp.region.name}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {camp.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Cover Image */}
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                {camp.coverImage ? (
                  <Image
                    src={camp.coverImage}
                    alt={camp.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <span className="text-6xl">🏕️</span>
                  </div>
                )}
                {camp.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-400 text-yellow-900">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery */}
              {camp.gallery.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {camp.gallery.slice(0, 4).map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={image.imageUrl}
                        alt={image.caption || `${camp.name} gallery ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Title & Meta */}
              <div className="mt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-2">
                      {camp.campType.name}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {camp.name}
                    </h1>
                  </div>
                  {camp.logo && (
                    <div className="shrink-0">
                      <Image
                        src={camp.logo}
                        alt={`${camp.name} logo`}
                        width={80}
                        height={80}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Meta Info */}
                <div className="mt-4 flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>
                      {camp.city && `${camp.city}, `}
                      {camp.region.name}
                    </span>
                  </div>
                  {(camp.ageMin || camp.ageMax) && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span>
                        Ages {camp.ageMin || 0} - {camp.ageMax || 18}
                      </span>
                    </div>
                  )}
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span>
                        {averageRating.toFixed(1)} ({camp.reviews.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                {upcomingSessions.length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-500">Starting from</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {upcomingSessions[0].currency === "EUR" ? "€" : "$"}
                        {Math.min(...upcomingSessions.map((s) => s.price)).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <h3 className="font-medium text-gray-900">
                        Upcoming Sessions
                      </h3>
                      {upcomingSessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {session.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(session.startDate).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                              {" - "}
                              {new Date(session.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {session.currency === "EUR" ? "€" : "$"}
                            {session.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center mb-6">
                    <p className="text-gray-500">Contact for pricing</p>
                  </div>
                )}

                <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition-colors">
                  Request Information
                </button>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  {camp.email && (
                    <a
                      href={`mailto:${camp.email}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Mail className="h-4 w-4" />
                      {camp.email}
                    </a>
                  )}
                  {camp.phone && (
                    <a
                      href={`tel:${camp.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Phone className="h-4 w-4" />
                      {camp.phone}
                    </a>
                  )}
                  {camp.website && (
                    <a
                      href={camp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {camp.description && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About This Camp
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-line">
                    {camp.description}
                  </p>
                </div>
              </section>
            )}

            {/* Highlights */}
            {camp.highlights.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Program Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {camp.highlights.map((highlight) => (
                    <div
                      key={highlight.id}
                      className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-100"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {highlight.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Activities */}
            {camp.activities.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Activities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {camp.activities.map((activity) => (
                    <span
                      key={activity.id}
                      className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700"
                    >
                      {activity.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Facilities */}
            {camp.facilities.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Facilities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {camp.facilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100"
                    >
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm text-gray-700">
                        {facility.name}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Schedule */}
            {camp.schedule.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sample Schedule
                </h2>
                <div className="space-y-3">
                  {camp.schedule.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-lg bg-white border border-gray-100"
                    >
                      <div className="shrink-0 w-20 text-center">
                        <span className="text-sm font-medium text-blue-600">
                          {item.time}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.activity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQs */}
            {camp.faqs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {camp.faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="p-4 rounded-lg bg-white border border-gray-100"
                    >
                      <h3 className="font-medium text-gray-900">
                        {faq.question}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {camp.reviews.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Reviews
                </h2>
                <div className="space-y-4">
                  {camp.reviews.map((review) => {
                    const userName = review.user
                      ? `${review.user.firstName || ""} ${review.user.lastName || ""}`.trim()
                      : review.authorName || "Anonymous";
                    return (
                      <div
                        key={review.id}
                        className="p-4 rounded-lg bg-white border border-gray-100"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {review.user?.image ? (
                              <Image
                                src={review.user.image}
                                alt={userName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-500">
                                {userName[0] || "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{userName}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-gray-900 mb-1">
                            {review.title}
                          </h4>
                        )}
                        {review.content && (
                          <p className="text-sm text-gray-600">{review.content}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              {camp.categories.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Available Months
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {camp.categories.map((rel) => (
                      <span
                        key={rel.category.id}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-sm text-blue-700"
                      >
                        {rel.category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Placeholder */}
              {camp.address && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="mt-4 text-sm text-gray-600">{camp.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Camps */}
      {relatedCamps.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Similar Camps You May Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCamps.map((camp) => (
                <CampCard key={camp.id} camp={camp} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
