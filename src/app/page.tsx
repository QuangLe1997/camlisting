import Link from "next/link";
import { Search, MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import { getFeaturedCamps, getCampTypes, getPopularRegions } from "@/lib/data";
import CampCard from "@/components/camps/CampCard";

export default async function HomePage() {
  const [featuredCamps, campTypes, popularRegions] = await Promise.all([
    getFeaturedCamps(6),
    getCampTypes(),
    getPopularRegions(8),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find the Perfect Camp
              <br />
              <span className="text-blue-200">for Your Child</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
              Discover exceptional summer camps, language programs, and educational
              experiences worldwide. Compare options and find the ideal fit.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-10 max-w-3xl">
              <form action="/camps" method="GET" className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search camps by name, location, or activity..."
                    className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-gray-900 shadow-lg placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-yellow-500 px-8 py-4 font-semibold text-gray-900 shadow-lg hover:bg-yellow-400 transition-colors"
                >
                  Search Camps
                </button>
              </form>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-200" />
                <span>50+ Destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-200" />
                <span>Year-round Programs</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-200" />
                <span>Ages 6-18</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Camp Types Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Camp Type</h2>
            <p className="mt-3 text-gray-600">
              Find the perfect program that matches your child&apos;s interests
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {campTypes.map((type) => (
              <Link
                key={type.id}
                href={`/camps?type=${type.slug}`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center hover:from-blue-50 hover:to-blue-100 transition-all duration-300"
              >
                <div className="text-4xl mb-3">
                  {type.slug === "language-camps" && "🗣️"}
                  {type.slug === "overnight-camps" && "🏕️"}
                  {type.slug === "day-camps" && "☀️"}
                  {type.slug === "online-camps" && "💻"}
                  {type.slug === "group-trips" && "✈️"}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {type.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {type._count.camps} camps
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Camps Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Camps</h2>
              <p className="mt-3 text-gray-600">
                Hand-picked exceptional programs for an unforgettable experience
              </p>
            </div>
            <Link
              href="/camps"
              className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              View all camps
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCamps.map((camp) => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/camps"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              View all camps
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
            <p className="mt-3 text-gray-600">
              Explore camps in the most sought-after locations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularRegions.map((region) => (
              <Link
                key={region.id}
                href={`/camps?region=${region.slug}`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 aspect-[4/3] flex items-end p-4 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative">
                  <h3 className="font-semibold text-white text-lg">{region.name}</h3>
                  <p className="text-sm text-gray-300">
                    {region._count.camps} {region._count.camps === 1 ? "camp" : "camps"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Find the Perfect Camp?
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Browse our complete collection of verified camps and programs.
            Compare options and find the ideal experience for your child.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/camps"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-gray-100 transition-colors"
            >
              Browse All Camps
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              List Your Camp
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
