import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/site-url';

type SitemapEntry = MetadataRoute.Sitemap[number];

function createEntry({
  path,
  lastModified,
  changeFrequency,
  priority,
}: {
  path: string;
  lastModified?: Date;
  changeFrequency: SitemapEntry['changeFrequency'];
  priority: number;
}): SitemapEntry {
  return {
    url: new URL(path, getSiteUrl()).toString(),
    lastModified,
    changeFrequency,
    priority,
  };
}

function getStaticEntries(): MetadataRoute.Sitemap {
  return [
    createEntry({
      path: '/',
      changeFrequency: 'weekly',
      priority: 1,
    }),
    createEntry({
      path: '/profil',
      changeFrequency: 'monthly',
      priority: 0.9,
    }),
    createEntry({
      path: '/program',
      changeFrequency: 'weekly',
      priority: 0.9,
    }),
    createEntry({
      path: '/fasilitas',
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    createEntry({
      path: '/guru',
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    createEntry({
      path: '/prestasi',
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
    createEntry({
      path: '/ekstrakurikuler',
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
    createEntry({
      path: '/berita',
      changeFrequency: 'daily',
      priority: 0.9,
    }),
    createEntry({
      path: '/pengumuman',
      changeFrequency: 'daily',
      priority: 0.9,
    }),
    createEntry({
      path: '/galeri',
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
    createEntry({
      path: '/dokumen',
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
    createEntry({
      path: '/faq',
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
    createEntry({
      path: '/testimoni',
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
    createEntry({
      path: '/ppdb',
      changeFrequency: 'weekly',
      priority: 0.9,
    }),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = getStaticEntries();
  const now = new Date();

  try {
    const [
      posts,
      announcements,
      galleryAlbums,
      documents,
      programs,
      facilities,
      achievements,
      extracurriculars,
      teachers,
    ] = await Promise.all([
      prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
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
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

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
        select: {
          slug: true,
          updatedAt: true,
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
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.downloadDocument.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.program.findMany({
        where: {
          isActive: true,
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
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.facility.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
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
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.extracurricular.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.teacher.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
    ]);

    const dynamicEntries: MetadataRoute.Sitemap = [
      ...posts.map((post) =>
        createEntry({
          path: `/berita/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.8,
        }),
      ),

      ...announcements.map((announcement) =>
        createEntry({
          path: `/pengumuman/${announcement.slug}`,
          lastModified: announcement.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        }),
      ),

      ...galleryAlbums.map((album) =>
        createEntry({
          path: `/galeri/${album.slug}`,
          lastModified: album.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
        }),
      ),

      ...documents.map((document) =>
        createEntry({
          path: `/dokumen/${document.slug}`,
          lastModified: document.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
        }),
      ),

      ...programs.map((program) =>
        createEntry({
          path: `/program/${program.slug}`,
          lastModified: program.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.8,
        }),
      ),

      ...facilities.map((facility) =>
        createEntry({
          path: `/fasilitas/${facility.slug}`,
          lastModified: facility.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
        }),
      ),

      ...achievements.map((achievement) =>
        createEntry({
          path: `/prestasi/${achievement.slug}`,
          lastModified: achievement.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
        }),
      ),

      ...extracurriculars.map((extracurricular) =>
        createEntry({
          path: `/ekstrakurikuler/${extracurricular.slug}`,
          lastModified: extracurricular.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
        }),
      ),

      ...teachers.map((teacher) =>
        createEntry({
          path: `/guru/${teacher.slug}`,
          lastModified: teacher.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
        }),
      ),
    ];

    return [...staticEntries, ...dynamicEntries];
  } catch (error) {
    console.error('Gagal membangun sitemap dinamis:', error);

    return staticEntries;
  }
}
