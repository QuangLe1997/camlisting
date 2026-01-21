import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const camp = await prisma.camp.findUnique({
      where: { id },
      include: {
        campType: true,
        region: true,
        categories: { include: { category: true } },
        sessions: true,
        gallery: true,
        activities: true,
        facilities: true,
        highlights: true,
        faqs: true,
        schedule: true,
        reviews: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!camp) {
      return NextResponse.json({ error: "Camp not found" }, { status: 404 });
    }

    return NextResponse.json(camp);
  } catch (error) {
    console.error("Error fetching camp:", error);
    return NextResponse.json(
      { error: "Failed to fetch camp" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Check if camp exists
    const existingCamp = await prisma.camp.findUnique({
      where: { id },
    });

    if (!existingCamp) {
      return NextResponse.json({ error: "Camp not found" }, { status: 404 });
    }

    // Check for duplicate slug (excluding current camp)
    if (data.slug !== existingCamp.slug) {
      const slugExists = await prisma.camp.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A camp with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update camp with categories
    const camp = await prisma.$transaction(async (tx) => {
      // Delete existing categories
      await tx.campCategoryRelation.deleteMany({
        where: { campId: id },
      });

      // Update camp
      const updatedCamp = await tx.camp.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          shortDescription: data.shortDescription || null,
          address: data.address || null,
          city: data.city || null,
          country: data.country || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          coverImage: data.coverImage || null,
          logo: data.logo || null,
          videoUrl: data.videoUrl || null,
          ageMin: data.ageMin || null,
          ageMax: data.ageMax || null,
          published: data.published || false,
          featured: data.featured || false,
          campTypeId: data.campTypeId,
          regionId: data.regionId,
          email: data.email || null,
          phone: data.phone || null,
          website: data.website || null,
          categories: {
            create: (data.categoryIds || []).map((categoryId: string) => ({
              categoryId,
            })),
          },
        },
      });

      return updatedCamp;
    });

    return NextResponse.json(camp);
  } catch (error) {
    console.error("Error updating camp:", error);
    return NextResponse.json(
      { error: "Failed to update camp" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if camp exists
    const existingCamp = await prisma.camp.findUnique({
      where: { id },
    });

    if (!existingCamp) {
      return NextResponse.json({ error: "Camp not found" }, { status: 404 });
    }

    // Delete related records first, then the camp
    await prisma.$transaction(async (tx) => {
      // Delete related records
      await tx.campCategoryRelation.deleteMany({ where: { campId: id } });
      await tx.campSession.deleteMany({ where: { campId: id } });
      await tx.campGallery.deleteMany({ where: { campId: id } });
      await tx.campActivity.deleteMany({ where: { campId: id } });
      await tx.campFacility.deleteMany({ where: { campId: id } });
      await tx.campHighlight.deleteMany({ where: { campId: id } });
      await tx.campFAQ.deleteMany({ where: { campId: id } });
      await tx.campSchedule.deleteMany({ where: { campId: id } });
      await tx.review.deleteMany({ where: { campId: id } });
      await tx.inquiry.deleteMany({ where: { campId: id } });

      // Delete the camp
      await tx.camp.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting camp:", error);
    return NextResponse.json(
      { error: "Failed to delete camp" },
      { status: 500 }
    );
  }
}
