import { z } from 'zod';

const currentYear = new Date().getFullYear();

function optionalText(maximumLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);
}

const optionalEmail = z
  .string()
  .trim()
  .max(180, 'Email maksimal 180 karakter.')
  .refine(
    (value) => value === '' || z.string().email().safeParse(value).success,
    'Format email tidak valid.',
  )
  .transform((value) => value || null);

const optionalPhone = z
  .string()
  .trim()
  .max(30, 'Nomor telepon maksimal 30 karakter.')
  .refine(
    (value) => value === '' || /^[0-9+().\-\s/]+$/.test(value),
    'Format nomor telepon tidak valid.',
  )
  .transform((value) => value || null);

const optionalYear = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^\d{4}$/.test(value),
    'Tahun berdiri harus terdiri dari 4 angka.',
  )
  .transform((value) => (value === '' ? null : Number(value)))
  .refine(
    (value) => value === null || (value >= 1800 && value <= currentYear),
    `Tahun berdiri harus antara 1800 dan ${currentYear}.`,
  );

const multilineList = z
  .string()
  .max(10_000, 'Isi terlalu panjang.')
  .transform((value) =>
    value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
  );

export const schoolProfileSchema = z.object({
  schoolName: z
    .string()
    .trim()
    .min(1, 'Nama sekolah wajib diisi.')
    .max(180, 'Nama sekolah maksimal 180 karakter.'),

  shortName: optionalText(80, 'Nama singkat maksimal 80 karakter.'),

  npsn: z
    .string()
    .trim()
    .max(20, 'NPSN maksimal 20 karakter.')
    .refine(
      (value) => value === '' || /^[0-9]+$/.test(value),
      'NPSN hanya boleh berisi angka.',
    )
    .transform((value) => value || null),

  tagline: optionalText(220, 'Tagline maksimal 220 karakter.'),

  shortDescription: optionalText(
    2_000,
    'Deskripsi singkat maksimal 2.000 karakter.',
  ),

  history: optionalText(20_000, 'Sejarah sekolah maksimal 20.000 karakter.'),

  vision: optionalText(5_000, 'Visi sekolah maksimal 5.000 karakter.'),

  mission: multilineList,
  goals: multilineList,
  schoolValues: multilineList,

  accreditation: optionalText(50, 'Akreditasi maksimal 50 karakter.'),

  foundedYear: optionalYear,

  principalName: optionalText(
    120,
    'Nama kepala sekolah maksimal 120 karakter.',
  ),

  principalTitle: optionalText(
    120,
    'Jabatan kepala sekolah maksimal 120 karakter.',
  ),

  principalGreeting: optionalText(
    10_000,
    'Sambutan kepala sekolah maksimal 10.000 karakter.',
  ),

  address: optionalText(2_000, 'Alamat maksimal 2.000 karakter.'),

  village: optionalText(120, 'Kelurahan atau desa maksimal 120 karakter.'),

  district: optionalText(120, 'Kecamatan maksimal 120 karakter.'),

  city: optionalText(120, 'Kabupaten atau kota maksimal 120 karakter.'),

  province: optionalText(120, 'Provinsi maksimal 120 karakter.'),

  postalCode: z
    .string()
    .trim()
    .max(10, 'Kode pos maksimal 10 karakter.')
    .refine(
      (value) => value === '' || /^[0-9]+$/.test(value),
      'Kode pos hanya boleh berisi angka.',
    )
    .transform((value) => value || null),

  phone: optionalPhone,
  whatsapp: optionalPhone,
  email: optionalEmail,

  operationalHours: optionalText(180, 'Jam operasional maksimal 180 karakter.'),
});

export type SchoolProfileInput = z.infer<typeof schoolProfileSchema>;
