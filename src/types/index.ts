// Re-export Prisma types
export type {
  User,
  Region,
  CampType,
  CampCategory,
  Camp,
  CampSession,
  CampGallery,
  CampActivity,
  CampFacility,
  CampHighlight,
  CampFAQ,
  CampSchedule,
  Review,
  Inquiry,
  Page,
  SiteSettings,
} from "@prisma/client";

export { UserRole, InquiryStatus } from "@prisma/client";

// Extended types for frontend
export interface CampWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  coverImage: string | null;
  logo: string | null;
  city: string | null;
  country: string | null;
  ageMin: number | null;
  ageMax: number | null;
  featured: boolean;
  region: {
    id: string;
    name: string;
    slug: string;
  };
  campType: {
    id: string;
    name: string;
    slug: string;
  };
  sessions: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    price: number;
    currency: string;
  }[];
  reviews: {
    rating: number;
  }[];
  _count?: {
    reviews: number;
  };
}

export interface RegionWithChildren {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: RegionWithChildren[];
  _count?: {
    camps: number;
  };
}

export interface FilterParams {
  regionSlug?: string;
  campTypeSlug?: string;
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
}
