import prisma from "@/lib/db";

export async function getCampTypes() {
  return prisma.campType.findMany({
    include: {
      _count: {
        select: { camps: { where: { published: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCampTypeBySlug(slug: string) {
  return prisma.campType.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { camps: { where: { published: true } } },
      },
    },
  });
}
