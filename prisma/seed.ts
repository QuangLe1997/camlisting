import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Data directory path
const DATA_DIR = path.join(__dirname, "../../worldcamps_data/html");

async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Create Admin User
  console.log("👤 Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@camlisting.com" },
    update: {},
    create: {
      email: "admin@camlisting.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });
  console.log(`   ✅ Admin created: ${admin.email}\n`);

  // 2. Create Camp Types
  console.log("🏕️ Creating camp types...");
  const campTypes = [
    { name: "Language Camps", slug: "language-camps", icon: "Languages", sortOrder: 1 },
    { name: "Overnight Camps", slug: "overnight-camps", icon: "Moon", sortOrder: 2 },
    { name: "Day Camps", slug: "day-camps", icon: "Sun", sortOrder: 3 },
    { name: "Online Camps", slug: "online-camps", icon: "Monitor", sortOrder: 4 },
    { name: "Group Trips", slug: "group-trips", icon: "Users", sortOrder: 5 },
  ];

  for (const type of campTypes) {
    await prisma.campType.upsert({
      where: { slug: type.slug },
      update: type,
      create: type,
    });
  }
  console.log(`   ✅ Created ${campTypes.length} camp types\n`);

  // 3. Create Camp Categories (Months)
  console.log("📅 Creating camp categories (months)...");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (let i = 0; i < months.length; i++) {
    await prisma.campCategory.upsert({
      where: { slug: months[i].toLowerCase() },
      update: { name: months[i], sortOrder: i + 1 },
      create: { name: months[i], slug: months[i].toLowerCase(), sortOrder: i + 1 },
    });
  }
  console.log(`   ✅ Created ${months.length} categories\n`);

  // 4. Create Regions (Hierarchical)
  console.log("🌍 Creating regions...");
  const regions = await createRegions();
  console.log(`   ✅ Created ${regions.length} regions\n`);

  // 5. Get camp type and region for camps
  const languageCampType = await prisma.campType.findUnique({ where: { slug: "language-camps" } });
  const overnightCampType = await prisma.campType.findUnique({ where: { slug: "overnight-camps" } });

  // 6. Create Sample Camps
  console.log("🏕️ Creating sample camps...");
  await createSampleCamps(languageCampType!, overnightCampType!);
  console.log("   ✅ Camps created\n");

  // 7. Create static pages
  console.log("📄 Creating static pages...");
  await createStaticPages();
  console.log("   ✅ Static pages created\n");

  console.log("✨ Seed completed successfully!");
}

async function createRegions() {
  const regionsData = [
    // Level 0: Continents
    { name: "Europe", slug: "europe", parentSlug: null, sortOrder: 1 },
    { name: "Americas", slug: "america", parentSlug: null, sortOrder: 2 },
    { name: "Asia", slug: "asia", parentSlug: null, sortOrder: 3 },
    { name: "Oceania", slug: "oceania", parentSlug: null, sortOrder: 4 },
    { name: "Africa", slug: "africa", parentSlug: null, sortOrder: 5 },

    // Level 1: Europe sub-regions
    { name: "Northern Europe", slug: "northern-europe", parentSlug: "europe", sortOrder: 1 },
    { name: "Western Europe", slug: "western-europe", parentSlug: "europe", sortOrder: 2 },
    { name: "Southern Europe", slug: "southern-europe", parentSlug: "europe", sortOrder: 3 },
    { name: "Eastern Europe", slug: "eastern-europe", parentSlug: "europe", sortOrder: 4 },

    // Level 1: Americas sub-regions
    { name: "North America", slug: "north-america", parentSlug: "america", sortOrder: 1 },
    { name: "Central America", slug: "central-america", parentSlug: "america", sortOrder: 2 },
    { name: "South America", slug: "south-america", parentSlug: "america", sortOrder: 3 },
    { name: "Caribbean", slug: "caribbean", parentSlug: "america", sortOrder: 4 },

    // Level 2: Northern Europe countries
    { name: "United Kingdom", slug: "united-kingdom", parentSlug: "northern-europe", sortOrder: 1 },
    { name: "Ireland", slug: "ireland", parentSlug: "northern-europe", sortOrder: 2 },
    { name: "Sweden", slug: "sweden", parentSlug: "northern-europe", sortOrder: 3 },
    { name: "Norway", slug: "norway", parentSlug: "northern-europe", sortOrder: 4 },
    { name: "Finland", slug: "finland", parentSlug: "northern-europe", sortOrder: 5 },
    { name: "Denmark", slug: "denmark", parentSlug: "northern-europe", sortOrder: 6 },

    // Level 2: Western Europe countries
    { name: "Switzerland", slug: "switzerland", parentSlug: "western-europe", sortOrder: 1 },
    { name: "France", slug: "france", parentSlug: "western-europe", sortOrder: 2 },
    { name: "Germany", slug: "germany", parentSlug: "western-europe", sortOrder: 3 },
    { name: "Netherlands", slug: "netherlands", parentSlug: "western-europe", sortOrder: 4 },
    { name: "Belgium", slug: "belgium", parentSlug: "western-europe", sortOrder: 5 },
    { name: "Austria", slug: "austria", parentSlug: "western-europe", sortOrder: 6 },

    // Level 2: Southern Europe countries
    { name: "Spain", slug: "spain", parentSlug: "southern-europe", sortOrder: 1 },
    { name: "Italy", slug: "italy", parentSlug: "southern-europe", sortOrder: 2 },
    { name: "Portugal", slug: "portugal", parentSlug: "southern-europe", sortOrder: 3 },
    { name: "Greece", slug: "greece", parentSlug: "southern-europe", sortOrder: 4 },

    // Level 2: North America countries
    { name: "United States of America", slug: "united-states-of-america", parentSlug: "north-america", sortOrder: 1 },
    { name: "Canada", slug: "canada", parentSlug: "north-america", sortOrder: 2 },
    { name: "Mexico", slug: "mexico", parentSlug: "north-america", sortOrder: 3 },

    // Level 3: UK regions
    { name: "England", slug: "england", parentSlug: "united-kingdom", sortOrder: 1 },
    { name: "Scotland", slug: "scotland", parentSlug: "united-kingdom", sortOrder: 2 },
    { name: "Wales", slug: "wales", parentSlug: "united-kingdom", sortOrder: 3 },
    { name: "Northern Ireland", slug: "northern-ireland", parentSlug: "united-kingdom", sortOrder: 4 },

    // Level 3: Switzerland regions
    { name: "Lausanne", slug: "lausanne", parentSlug: "switzerland", sortOrder: 1 },
    { name: "Leysin", slug: "leysin", parentSlug: "switzerland", sortOrder: 2 },
    { name: "Zurich", slug: "zurich", parentSlug: "switzerland", sortOrder: 3 },
    { name: "Geneva", slug: "geneva", parentSlug: "switzerland", sortOrder: 4 },
    { name: "Crans Montana", slug: "crans-montana", parentSlug: "switzerland", sortOrder: 5 },

    // Level 3: USA regions
    { name: "Northeast", slug: "northeast-usa", parentSlug: "united-states-of-america", sortOrder: 1 },
    { name: "Southeast", slug: "southeast-usa", parentSlug: "united-states-of-america", sortOrder: 2 },
    { name: "Midwest", slug: "midwest-usa", parentSlug: "united-states-of-america", sortOrder: 3 },
    { name: "Southwest", slug: "southwest-usa", parentSlug: "united-states-of-america", sortOrder: 4 },
    { name: "West", slug: "west-usa", parentSlug: "united-states-of-america", sortOrder: 5 },

    // Level 4: England cities
    { name: "London", slug: "london", parentSlug: "england", sortOrder: 1 },
    { name: "Cambridge", slug: "cambridge", parentSlug: "england", sortOrder: 2 },
    { name: "Oxford", slug: "oxford", parentSlug: "england", sortOrder: 3 },
    { name: "Brighton", slug: "brighton", parentSlug: "england", sortOrder: 4 },
    { name: "Manchester", slug: "manchester", parentSlug: "england", sortOrder: 5 },

    // Level 4: Scotland cities
    { name: "Edinburgh", slug: "edinburgh", parentSlug: "scotland", sortOrder: 1 },
    { name: "Elgin", slug: "elgin-scotland", parentSlug: "scotland", sortOrder: 2 },
    { name: "St Andrews", slug: "st-andrews", parentSlug: "scotland", sortOrder: 3 },

    // Level 4: Spain cities
    { name: "Barcelona", slug: "barcelona", parentSlug: "spain", sortOrder: 1 },
    { name: "Madrid", slug: "madrid", parentSlug: "spain", sortOrder: 2 },
    { name: "Galicia", slug: "galicia", parentSlug: "spain", sortOrder: 3 },

    // Level 4: France cities
    { name: "Paris", slug: "paris", parentSlug: "france", sortOrder: 1 },
    { name: "Nice", slug: "nice", parentSlug: "france", sortOrder: 2 },
    { name: "Lyon", slug: "lyon", parentSlug: "france", sortOrder: 3 },

    // Asia countries
    { name: "Japan", slug: "japan", parentSlug: "asia", sortOrder: 1 },
    { name: "Thailand", slug: "thailand", parentSlug: "asia", sortOrder: 2 },
    { name: "Singapore", slug: "singapore", parentSlug: "asia", sortOrder: 3 },
    { name: "China", slug: "china", parentSlug: "asia", sortOrder: 4 },
  ];

  // Create regions level by level
  const createdRegions: any[] = [];

  // First pass: create all regions without parent
  for (const region of regionsData) {
    const created = await prisma.region.upsert({
      where: { slug: region.slug },
      update: { name: region.name, sortOrder: region.sortOrder },
      create: {
        name: region.name,
        slug: region.slug,
        sortOrder: region.sortOrder,
      },
    });
    createdRegions.push({ ...created, parentSlug: region.parentSlug });
  }

  // Second pass: update parent relationships
  for (const region of createdRegions) {
    if (region.parentSlug) {
      const parent = await prisma.region.findUnique({ where: { slug: region.parentSlug } });
      if (parent) {
        await prisma.region.update({
          where: { id: region.id },
          data: { parentId: parent.id },
        });
      }
    }
  }

  return createdRegions;
}

async function createSampleCamps(languageCampType: { id: string }, overnightCampType: { id: string }) {
  // Get regions
  const scotland = await prisma.region.findUnique({ where: { slug: "elgin-scotland" } });
  const barcelona = await prisma.region.findUnique({ where: { slug: "barcelona" } });
  const lausanne = await prisma.region.findUnique({ where: { slug: "lausanne" } });
  const cambridge = await prisma.region.findUnique({ where: { slug: "cambridge" } });
  const london = await prisma.region.findUnique({ where: { slug: "london" } });

  if (!scotland || !barcelona || !lausanne || !cambridge || !london) {
    console.log("   ⚠️ Some regions not found, skipping camp creation");
    return;
  }

  // Get categories
  const june = await prisma.campCategory.findUnique({ where: { slug: "june" } });
  const july = await prisma.campCategory.findUnique({ where: { slug: "july" } });
  const august = await prisma.campCategory.findUnique({ where: { slug: "august" } });

  const camps = [
    {
      name: "Gordonstoun International Summer School",
      slug: "gordonstoun-school-summer-school",
      description: `<p>Gordonstoun International Summer School offers a unique combination of academic enrichment and outdoor adventure set in the stunning Scottish Highlands. Our programs are designed to challenge and inspire young people from around the world.</p>
      <p>Students participate in a wide range of activities including sailing, hiking, leadership challenges, and academic workshops. The school's historic campus provides an inspiring backdrop for learning and personal growth.</p>
      <p>Our experienced staff ensure that every student receives individual attention while developing confidence, resilience, and international friendships that last a lifetime.</p>`,
      shortDescription: "Experience adventure and academic excellence in the Scottish Highlands",
      regionId: scotland.id,
      campTypeId: overnightCampType.id,
      ageMin: 8,
      ageMax: 17,
      founded: 1976,
      staffRatio: "1:3",
      languages: ["English"],
      coverImage: "https://world-camps.org/wp-content/uploads/2026/01/WCCover-GISS-1536x768.jpg",
      logo: "https://world-camps.org/wp-content/uploads/2026/01/GISS_Logo-1-Caroline-Overton.png",
      website: "https://www.gordonstoun.org.uk",
      city: "Elgin",
      country: "United Kingdom",
      latitude: 57.7089,
      longitude: -3.2218,
      featured: true,
      sessions: [
        { name: "Session 1", startDate: new Date("2026-07-03"), endDate: new Date("2026-07-16"), price: 4650, currency: "USD" },
        { name: "Session 2", startDate: new Date("2026-07-17"), endDate: new Date("2026-07-30"), price: 4650, currency: "USD" },
        { name: "Full Program", startDate: new Date("2026-07-03"), endDate: new Date("2026-08-02"), price: 8500, currency: "USD" },
      ],
      activities: [
        "Sailing", "Hiking", "Rock Climbing", "Mountain Biking", "Swimming",
        "Drama", "Arts & Crafts", "Music", "Photography", "Leadership Training"
      ],
      facilities: [
        "Swimming Pool", "Sports Fields", "Tennis Courts", "Dining Hall",
        "Medical Center", "Library", "Art Studio", "Music Room"
      ],
      highlights: [
        "Historic Scottish campus", "Outdoor adventure focus", "International community",
        "Small group sizes", "Experienced staff", "Leadership development"
      ],
      faqs: [
        { question: "What is the staff-to-student ratio?", answer: "We maintain a 1:3 staff-to-student ratio to ensure personalized attention and safety." },
        { question: "Are meals included?", answer: "Yes, three nutritious meals per day are included, with options for dietary requirements." },
        { question: "What is the cancellation policy?", answer: "Full refund if cancelled 60+ days before start. 50% refund 30-60 days before." },
      ],
      categories: [june?.id, july?.id, august?.id].filter(Boolean),
    },
    {
      name: "Expanish Barcelona Summer Camp",
      slug: "expanish-barcelona-summer-camp",
      description: `<p>Immerse yourself in Spanish language and culture at our Barcelona summer camp. Located in the heart of one of Europe's most vibrant cities, our program combines intensive Spanish classes with exciting cultural activities.</p>
      <p>Students explore Barcelona's iconic landmarks including Gaudí's masterpieces, enjoy Mediterranean beaches, and experience authentic Spanish cuisine. Our qualified teachers use innovative methods to make learning fun and effective.</p>`,
      shortDescription: "Learn Spanish while exploring beautiful Barcelona",
      regionId: barcelona.id,
      campTypeId: languageCampType.id,
      ageMin: 14,
      ageMax: 18,
      founded: 2012,
      staffRatio: "1:8",
      languages: ["Spanish", "English"],
      coverImage: "https://world-camps.org/wp-content/uploads/2024/06/expanish-barcelona-cover.jpg",
      website: "https://www.expanish.com",
      city: "Barcelona",
      country: "Spain",
      latitude: 41.3851,
      longitude: 2.1734,
      featured: true,
      sessions: [
        { name: "June Session", startDate: new Date("2026-06-15"), endDate: new Date("2026-06-28"), price: 2800, currency: "EUR" },
        { name: "July Session", startDate: new Date("2026-07-06"), endDate: new Date("2026-07-19"), price: 2800, currency: "EUR" },
      ],
      activities: [
        "Spanish Classes", "City Tours", "Beach Activities", "Cooking Classes",
        "Flamenco Dancing", "Museum Visits", "Sports"
      ],
      facilities: [
        "Modern Classrooms", "Student Lounge", "Cafeteria", "Computer Lab"
      ],
      highlights: [
        "Native Spanish teachers", "City center location", "Beach access",
        "Cultural excursions", "Small class sizes"
      ],
      faqs: [
        { question: "What level of Spanish do I need?", answer: "We accept all levels from complete beginners to advanced speakers." },
        { question: "Where do students stay?", answer: "Students stay with carefully selected Spanish host families." },
      ],
      categories: [june?.id, july?.id].filter(Boolean),
    },
    {
      name: "EHL Hospitality Summer School",
      slug: "ehl-hospitality-summer-school",
      description: `<p>Experience the world of hospitality at EHL, the world's first and most prestigious hospitality management school. Our summer program gives students a taste of what it's like to study at EHL.</p>
      <p>Set on the beautiful shores of Lake Geneva in Lausanne, Switzerland, students learn about hospitality management, culinary arts, and leadership while enjoying the stunning Swiss Alps scenery.</p>`,
      shortDescription: "Discover hospitality excellence at the world's top hotel school",
      regionId: lausanne.id,
      campTypeId: overnightCampType.id,
      ageMin: 15,
      ageMax: 18,
      founded: 1893,
      staffRatio: "1:10",
      languages: ["English", "French"],
      coverImage: "https://world-camps.org/wp-content/uploads/2024/06/ehl-lausanne-cover.jpg",
      website: "https://www.ehl.edu",
      city: "Lausanne",
      country: "Switzerland",
      latitude: 46.5197,
      longitude: 6.6323,
      featured: true,
      sessions: [
        { name: "Summer Session", startDate: new Date("2026-07-13"), endDate: new Date("2026-07-26"), price: 6500, currency: "CHF" },
      ],
      activities: [
        "Hospitality Management", "Culinary Arts", "Event Planning",
        "Wine Tasting", "Hotel Operations", "Leadership Workshops"
      ],
      facilities: [
        "Training Hotels", "Professional Kitchens", "Conference Rooms",
        "Sports Center", "Lake Access"
      ],
      highlights: [
        "World-renowned institution", "Industry connections", "Swiss quality",
        "Beautiful campus", "Career exploration"
      ],
      faqs: [
        { question: "Is this program for future hospitality students only?", answer: "No, the program is open to all students interested in hospitality, business, or leadership." },
      ],
      categories: [july?.id].filter(Boolean),
    },
    {
      name: "Cambridge Academic Summer School",
      slug: "cambridge-academic-summer-school",
      description: `<p>Study at one of the world's most prestigious universities during our Cambridge Academic Summer School. Students live and learn in historic college settings while experiencing the intellectual atmosphere that has inspired centuries of scholars.</p>
      <p>Our program offers a range of academic subjects taught by experienced tutors using the famous Cambridge supervisions system of small group teaching.</p>`,
      shortDescription: "Academic excellence in historic Cambridge colleges",
      regionId: cambridge.id,
      campTypeId: overnightCampType.id,
      ageMin: 13,
      ageMax: 18,
      founded: 2005,
      staffRatio: "1:5",
      languages: ["English"],
      coverImage: "https://world-camps.org/wp-content/uploads/2024/06/cambridge-summer-cover.jpg",
      website: "https://www.cambridge-summer.com",
      city: "Cambridge",
      country: "United Kingdom",
      latitude: 52.2053,
      longitude: 0.1218,
      featured: false,
      sessions: [
        { name: "Session 1", startDate: new Date("2026-07-05"), endDate: new Date("2026-07-18"), price: 4200, currency: "GBP" },
        { name: "Session 2", startDate: new Date("2026-07-19"), endDate: new Date("2026-08-01"), price: 4200, currency: "GBP" },
      ],
      activities: [
        "Academic Classes", "Punting", "College Visits", "Debates",
        "Sports", "Social Events", "London Excursion"
      ],
      facilities: [
        "Historic Colleges", "Libraries", "Sports Grounds", "Dining Halls"
      ],
      highlights: [
        "Cambridge colleges", "Small group teaching", "Academic focus",
        "Historic setting", "University preparation"
      ],
      faqs: [
        { question: "Which subjects are available?", answer: "We offer subjects including Science, Engineering, Medicine, Law, Business, and Humanities." },
      ],
      categories: [july?.id, august?.id].filter(Boolean),
    },
    {
      name: "InvestIN Education London",
      slug: "investin-education-london",
      description: `<p>InvestIN offers career-focused summer programs in London for ambitious teenagers. Students gain real-world insights into their dream careers through immersive experiences with industry professionals.</p>
      <p>Programs include Medicine, Law, Investment Banking, Engineering, Architecture, and many more. Students visit real workplaces, hear from successful professionals, and develop practical skills.</p>`,
      shortDescription: "Career exploration programs for ambitious teens in London",
      regionId: london.id,
      campTypeId: overnightCampType.id,
      ageMin: 12,
      ageMax: 18,
      founded: 2013,
      staffRatio: "1:8",
      languages: ["English"],
      coverImage: "https://world-camps.org/wp-content/uploads/2024/06/investin-london-cover.jpg",
      website: "https://www.investin.org",
      city: "London",
      country: "United Kingdom",
      latitude: 51.5074,
      longitude: -0.1278,
      featured: false,
      sessions: [
        { name: "Medicine Week", startDate: new Date("2026-07-06"), endDate: new Date("2026-07-10"), price: 1995, currency: "GBP" },
        { name: "Law Week", startDate: new Date("2026-07-13"), endDate: new Date("2026-07-17"), price: 1995, currency: "GBP" },
        { name: "Investment Banking", startDate: new Date("2026-07-20"), endDate: new Date("2026-07-24"), price: 1995, currency: "GBP" },
      ],
      activities: [
        "Industry Visits", "Professional Workshops", "Networking Sessions",
        "Presentations", "Team Projects", "Career Guidance"
      ],
      facilities: [
        "Central London Venues", "Conference Rooms", "Partner Company Offices"
      ],
      highlights: [
        "Real industry exposure", "Professional speakers", "Career clarity",
        "London experience", "CV enhancement"
      ],
      faqs: [
        { question: "What careers are covered?", answer: "We offer 20+ career areas including Medicine, Law, Finance, Engineering, Film, and more." },
      ],
      categories: [july?.id].filter(Boolean),
    },
  ];

  for (const campData of camps) {
    const { sessions, activities, facilities, highlights, faqs, categories, ...camp } = campData;

    // Create or update camp
    const createdCamp = await prisma.camp.upsert({
      where: { slug: camp.slug },
      update: camp,
      create: camp,
    });

    // Create sessions
    for (let i = 0; i < sessions.length; i++) {
      await prisma.campSession.upsert({
        where: {
          id: `${createdCamp.id}-session-${i}`,
        },
        update: { ...sessions[i], sortOrder: i },
        create: {
          id: `${createdCamp.id}-session-${i}`,
          campId: createdCamp.id,
          ...sessions[i],
          sortOrder: i,
        },
      });
    }

    // Create activities
    for (let i = 0; i < activities.length; i++) {
      await prisma.campActivity.upsert({
        where: { id: `${createdCamp.id}-activity-${i}` },
        update: { name: activities[i], sortOrder: i },
        create: {
          id: `${createdCamp.id}-activity-${i}`,
          campId: createdCamp.id,
          name: activities[i],
          sortOrder: i,
        },
      });
    }

    // Create facilities
    for (let i = 0; i < facilities.length; i++) {
      await prisma.campFacility.upsert({
        where: { id: `${createdCamp.id}-facility-${i}` },
        update: { name: facilities[i], sortOrder: i },
        create: {
          id: `${createdCamp.id}-facility-${i}`,
          campId: createdCamp.id,
          name: facilities[i],
          sortOrder: i,
        },
      });
    }

    // Create highlights
    for (let i = 0; i < highlights.length; i++) {
      await prisma.campHighlight.upsert({
        where: { id: `${createdCamp.id}-highlight-${i}` },
        update: { text: highlights[i], sortOrder: i },
        create: {
          id: `${createdCamp.id}-highlight-${i}`,
          campId: createdCamp.id,
          text: highlights[i],
          sortOrder: i,
        },
      });
    }

    // Create FAQs
    if (faqs) {
      for (let i = 0; i < faqs.length; i++) {
        await prisma.campFAQ.upsert({
          where: { id: `${createdCamp.id}-faq-${i}` },
          update: { ...faqs[i], sortOrder: i },
          create: {
            id: `${createdCamp.id}-faq-${i}`,
            campId: createdCamp.id,
            ...faqs[i],
            sortOrder: i,
          },
        });
      }
    }

    // Create category relations
    if (categories) {
      for (const categoryId of categories) {
        await prisma.campCategoryRelation.upsert({
          where: {
            campId_categoryId: { campId: createdCamp.id, categoryId: categoryId as string },
          },
          update: {},
          create: {
            campId: createdCamp.id,
            categoryId: categoryId as string,
          },
        });
      }
    }

    console.log(`   📍 Created camp: ${camp.name}`);
  }
}

async function createStaticPages() {
  const pages = [
    {
      title: "About World Camps",
      slug: "about",
      content: `<h2>About World Camps</h2>
      <p>World Camps by World Schools helps families find and book the best summer camps for kids and teens worldwide.</p>
      <p>Our mission is to connect families with exceptional camp experiences that inspire, educate, and create lasting memories.</p>
      <h3>Our Story</h3>
      <p>Founded in 2015, World Camps has helped thousands of families discover amazing camp experiences around the globe.</p>`,
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: `<h2>Privacy Policy</h2>
      <p>Last updated: January 2026</p>
      <h3>Information We Collect</h3>
      <p>We collect information you provide directly to us when you create an account, make inquiries, or contact us.</p>
      <h3>How We Use Your Information</h3>
      <p>We use the information we collect to provide, maintain, and improve our services.</p>`,
    },
    {
      title: "Terms of Use",
      slug: "terms-of-use",
      content: `<h2>Terms of Use</h2>
      <p>Last updated: January 2026</p>
      <h3>Acceptance of Terms</h3>
      <p>By accessing and using World Camps, you accept and agree to be bound by these Terms of Use.</p>
      <h3>Use of Service</h3>
      <p>You may use our service for lawful purposes only and in accordance with these Terms.</p>`,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
