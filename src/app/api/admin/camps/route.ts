import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Check for duplicate slug
    const existingCamp = await prisma.camp.findUnique({
      where: { slug: data.slug },
    });

    if (existingCamp) {
      return NextResponse.json(
        { error: "A camp with this slug already exists" },
        { status: 400 }
      );
    }

    // Create the camp
    const camp = await prisma.camp.create({
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
        ownerId: session.user.id,
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

    return NextResponse.json(camp);
  } catch (error) {
    console.error("Error creating camp:", error);
    return NextResponse.json(
      { error: "Failed to create camp" },
      { status: 500 }
    );
  }
}
