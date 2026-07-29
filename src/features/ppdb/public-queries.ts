import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const getActivePublicPpdb = cache(async () => {
  return prisma.ppdbInformation.findFirst({
    where: {
      isActive: true,
      status: {
        not: "DRAFT",
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      title: true,
      academicYear: true,
      status: true,
      shortDescription: true,
      description: true,
      quota: true,
      brochureUrl: true,
      externalRegistrationUrl: true,
      registrationLocation: true,
      contactPerson: true,
      contactPhone: true,
      contactEmail: true,
      serviceHours: true,
      scholarshipInformation: true,
      showFee: true,
      showExternalRegistrationButton: true,
      updatedAt: true,

      timelineItems: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            startDate: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          sortOrder: true,
        },
      },

      requirements: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          title: true,
          description: true,
          isRequired: true,
          sortOrder: true,
        },
      },

      flowSteps: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          sortOrder: true,
        },
      },

      fees: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          name: true,
          feeType: true,
          amount: true,
          description: true,
          isOptional: true,
          sortOrder: true,
        },
      },
    },
  });
});
