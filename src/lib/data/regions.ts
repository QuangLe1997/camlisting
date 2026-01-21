import prisma from "@/lib/db";

export async function getRegions() {
  return prisma.region.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
          _count: {
            select: { camps: { where: { published: true } } },
          },
        },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { camps: { where: { published: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getRegionBySlug(slug: string) {
  return prisma.region.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        include: {
          _count: {
            select: { camps: { where: { published: true } } },
          },
        },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { camps: { where: { published: true } } },
      },
    },
  });
}

export async function getPopularRegions(limit = 8) {
  const regions = await prisma.region.findMany({
    where: {
      camps: {
        some: { published: true },
      },
    },
    include: {
      _count: {
        select: { camps: { where: { published: true } } },
      },
    },
    orderBy: {
      camps: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return regions;
}
