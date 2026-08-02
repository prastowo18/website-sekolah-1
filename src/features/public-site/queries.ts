import { cache } from "react";

import { getPublicWebsiteSettings } from "@/features/website-setting/queries";
import { prisma } from "@/lib/prisma";

export const getPublicSchoolProfile = cache(async () => {
  return prisma.schoolProfile.findUnique({
    where: {
      id: "school",
    },
    select: {
      id: true,
      schoolName: true,
      shortName: true,
      npsn: true,
      logoUrl: true,
      faviconUrl: true,
      heroImageUrl: true,
      tagline: true,
      shortDescription: true,
      history: true,
      vision: true,
      mission: true,
      goals: true,
      schoolValues: true,
      accreditation: true,
      foundedYear: true,
      principalName: true,
      principalTitle: true,
      principalPhotoUrl: true,
      principalGreeting: true,
      address: true,
      village: true,
      district: true,
      city: true,
      province: true,
      postalCode: true,
      phone: true,
      whatsapp: true,
      email: true,
      operationalHours: true,

      mapEmbedUrl: true,
      latitude: true,
      longitude: true,
      updatedAt: true,
    },
  });
});

export const getPublicSocialLinks = cache(async () => {
  return prisma.socialLink.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        platform: "asc",
      },
    ],
    select: {
      id: true,
      platform: true,
      label: true,
      url: true,
      icon: true,
    },
  });
});

export const getPublicSiteChrome = cache(async () => {
  const [profile, socialLinks] = await Promise.all([
    getPublicSchoolProfile(),
    getPublicSocialLinks(),
  ]);

  return {
    profile,
    socialLinks,
  };
});

export const getPublicHomepageData = cache(async () => {
  const now = new Date();

  const [
    profile,
    settings,
    announcements,
    programs,
    facilities,
    principal,
    teacherCount,
    achievementCount,
    programCount,
    facilityCount,
    achievements,
    extracurriculars,
    posts,
    galleryAlbums,
    testimonials,
    ppdb,
  ] = await Promise.all([
    getPublicSchoolProfile(),
    getPublicWebsiteSettings(),

    prisma.announcement.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              {
                startDate: null,
              },
              {
                startDate: {
                  lte: now,
                },
              },
            ],
          },
          {
            OR: [
              {
                endDate: null,
              },
              {
                endDate: {
                  gte: now,
                },
              },
            ],
          },
        ],
      },
      orderBy: [
        {
          isPinned: "desc",
        },
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        priority: true,
        attachmentUrl: true,
        startDate: true,
        endDate: true,
        isPinned: true,
      },
    }),

    prisma.program.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        OR: [
          {
            publishedAt: null,
          },
          {
            publishedAt: {
              lte: now,
            },
          },
        ],
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        description: true,
        imageUrl: true,
        benefits: true,
      },
    }),

    prisma.facility.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        capacity: true,
        condition: true,
      },
    }),

    prisma.teacher.findFirst({
      where: {
        isActive: true,
        isPrincipal: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      select: {
        id: true,
        name: true,
        position: true,
        education: true,
        shortBiography: true,
        photoUrl: true,
      },
    }),

    prisma.teacher.count({
      where: {
        isActive: true,
      },
    }),

    prisma.achievement.count({
      where: {
        isPublished: true,
        OR: [
          {
            publishedAt: null,
          },
          {
            publishedAt: {
              lte: now,
            },
          },
        ],
      },
    }),

    prisma.program.count({
      where: {
        isActive: true,
      },
    }),

    prisma.facility.count({
      where: {
        isActive: true,
      },
    }),

    prisma.achievement.findMany({
      where: {
        isPublished: true,
        OR: [
          {
            publishedAt: null,
          },
          {
            publishedAt: {
              lte: now,
            },
          },
        ],
      },
      orderBy: [
        {
          achievementDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        achievementType: true,
        category: true,
        winnerName: true,
        competitionLevel: true,
        rank: true,
        achievementDate: true,
        description: true,
        imageUrl: true,
      },
    }),

    prisma.extracurricular.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        schedule: true,
        coach: true,
        targetClasses: true,
        imageUrl: true,
      },
    }),

    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          {
            publishedAt: null,
          },
          {
            publishedAt: {
              lte: now,
            },
          },
        ],
      },
      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImageUrl: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.galleryAlbum.findMany({
      where: {
        isPublished: true,
        OR: [
          {
            publishedAt: null,
          },
          {
            publishedAt: {
              lte: now,
            },
          },
        ],
      },
      orderBy: [
        {
          eventDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        eventDate: true,
        coverImageUrl: true,
        media: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
          select: {
            id: true,
            mediaType: true,
            fileUrl: true,
            thumbnailUrl: true,
            altText: true,
          },
        },
        _count: {
          select: {
            media: true,
          },
        },
      },
    }),

    prisma.testimonial.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 3,
      select: {
        id: true,
        name: true,
        role: true,
        content: true,
        photoUrl: true,
      },
    }),

    prisma.ppdbInformation.findFirst({
      where: {
        isActive: true,
        status: {
          not: "DRAFT",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        academicYear: true,
        status: true,
        shortDescription: true,
        quota: true,
        contactPhone: true,
        brochureUrl: true,
      },
    }),
  ]);

  return {
    profile,
    announcements,
    programs,
    facilities,
    principal,
    settings,
    statistics: {
      students: settings.homeStatsStudents,
      teachers:
        settings.homeStatsTeachers > 0
          ? settings.homeStatsTeachers
          : teacherCount,
      programs:
        settings.homeStatsPrograms > 0
          ? settings.homeStatsPrograms
          : programCount,
      achievements:
        settings.homeStatsAchievements > 0
          ? settings.homeStatsAchievements
          : achievementCount,
      facilities: facilityCount,
    },
    achievements,
    extracurriculars,
    posts,
    galleryAlbums,
    testimonials,
    ppdb,
  };
});
