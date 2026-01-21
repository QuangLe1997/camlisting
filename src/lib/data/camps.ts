import prisma from "@/lib/db";
import type { FilterParams } from "@/types";
import type { Prisma } from "@prisma/client";

// Define the include object for getCampBySlug
const campDetailInclude = {
  region: true,
  campType: true,
  categories: { include: { category: true } },
  sessions: {
    where: {
      endDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" as const },
  },
  gallery: {
    orderBy: { sortOrder: "asc" as const },
  },
  activities: {
    orderBy: { sortOrder: "asc" as const },
  },
  facilities: {
    orderBy: { sortOrder: "asc" as const },
  },
  highlights: {
    orderBy: { sortOrder: "asc" as const },
  },
  faqs: {
    orderBy: { sortOrder: "asc" as const },
  },
  schedule: {
    orderBy: { sortOrder: "asc" as const },
  },
  reviews: {
    where: { approved: true },
    include: {
      user: {
        select: { firstName: true, lastName: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
  owner: {
    select: { id: true, firstName: true, lastName: true, image: true },
  },
} satisfies Prisma.CampInclude;

export type CampDetail = Prisma.CampGetPayload<{ include: typeof campDetailInclude }>;

export async function getCamps(params: FilterParams = {}) {
  const { regionSlug, campTypeSlug, categorySlug, search, page = 1, limit = 12 } = params;

  const where: Record<string, unknown> = {
    published: true,
  };

  if (regionSlug) {
    where.region = { slug: regionSlug };
  }

  if (campTypeSlug) {
    where.campType = { slug: campTypeSlug };
  }

  if (categorySlug) {
    where.categories = {
      some: { slug: categorySlug },
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  const [camps, total] = await Promise.all([
    prisma.camp.findMany({
      where,
      include: {
        region: {
          select: { id: true, name: true, slug: true },
        },
        campType: {
          select: { id: true, name: true, slug: true },
        },
        sessions: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: "asc" },
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            price: true,
            currency: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.camp.count({ where }),
  ]);

  return {
    camps,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getFeaturedCamps(limit = 6) {
  return prisma.camp.findMany({
    where: {
      published: true,
      featured: true,
    },
    include: {
      region: {
        select: { id: true, name: true, slug: true },
      },
      campType: {
        select: { id: true, name: true, slug: true },
      },
      sessions: {
        where: {
          endDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
        take: 3,
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          price: true,
          currency: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getCampBySlug(slug: string): Promise<CampDetail | null> {
  return prisma.camp.findUnique({
    where: { slug },
    include: campDetailInclude,
  });
}

export async function getRelatedCamps(campId: string, regionId: string, campTypeId: string, limit = 4) {
  return prisma.camp.findMany({
    where: {
      published: true,
      id: { not: campId },
      OR: [
        { regionId },
        { campTypeId },
      ],
    },
    include: {
      region: {
        select: { id: true, name: true, slug: true },
      },
      campType: {
        select: { id: true, name: true, slug: true },
      },
      sessions: {
        where: {
          endDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
        take: 1,
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          price: true,
          currency: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { featured: "desc" },
    take: limit,
  });
}
