import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  AchievementType,
  AnnouncementPriority,
  CompetitionLevel,
  MediaType,
  PostStatus,
  PpdbFeeType,
  PpdbStatus,
  Prisma,
  PrismaClient,
  SettingValueType,
  UserRole,
} from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} belum dikonfigurasi di file .env.local atau .env.`,
    );
  }

  return value;
}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL atau DATABASE_URL belum dikonfigurasi.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const SHOWCASE_PUBLISHED_AT = new Date("2026-08-01T08:00:00+07:00");

function dateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateTimeWib(value: string): Date {
  const normalized = value.replace(" ", "T");

  return new Date(`${normalized}:00+07:00`);
}

const SCHOOL_PROFILE = {
  id: "school",
  schoolName: "SD Cendekia Nusantara",
  shortName: "SD Cendekia",
  npsn: "00000000",
  logoUrl: "https://picsum.photos/seed/demo-logo/1200/1200",
  faviconUrl: "https://picsum.photos/seed/demo-favicon/512/512",
  heroImageUrl: "https://picsum.photos/seed/demo-hero/1600/900",
  tagline: "Tumbuh Cerdas, Berkarakter, dan Peduli",
  shortDescription:
    "Sekolah dasar yang menghadirkan pembelajaran aktif, penguatan karakter, literasi digital, serta lingkungan belajar yang aman dan menyenangkan.",
  history:
    "SD Cendekia Nusantara didirikan pada tahun 2012 oleh Yayasan Cendekia Muda sebagai sekolah dasar yang memadukan penguasaan kompetensi akademik, pendidikan karakter, dan kepedulian terhadap lingkungan. Sekolah tumbuh dari empat ruang kelas menjadi lingkungan belajar terpadu yang melayani siswa kelas I sampai VI. Dalam perjalanannya, sekolah membangun budaya kolaborasi antara guru, siswa, dan orang tua melalui pembelajaran berbasis proyek, kegiatan literasi, serta program pengembangan minat dan bakat.",
  vision:
    "Menjadi sekolah dasar unggul yang membentuk generasi pembelajar, berkarakter, kreatif, sehat, dan peduli terhadap sesama serta lingkungan.",
  mission: [
    "Menyelenggarakan pembelajaran aktif dan berpusat pada siswa.",
    "Menanamkan nilai integritas, disiplin, tanggung jawab, dan kepedulian.",
    "Mengembangkan budaya literasi, numerasi, sains, seni, dan teknologi.",
    "Menciptakan lingkungan sekolah yang aman, sehat, inklusif, dan ramah anak.",
    "Membangun kemitraan yang terbuka dengan orang tua dan masyarakat.",
  ],
  goals: [
    "Meningkatkan kompetensi literasi dan numerasi siswa.",
    "Mendorong setiap siswa memiliki minimal satu bidang minat yang berkembang.",
    "Membiasakan perilaku hidup bersih, sehat, dan peduli lingkungan.",
    "Meningkatkan kompetensi guru melalui pelatihan berkelanjutan.",
    "Membangun komunikasi sekolah dan orang tua yang cepat dan transparan.",
  ],
  schoolValues: [
    "Integritas",
    "Disiplin",
    "Kreatif",
    "Peduli",
    "Kolaboratif",
    "Mandiri",
  ],
  accreditation: "A — Data Demo",
  foundedYear: 2012,
  principalName: "Siti Rahmawati, S.Pd.",
  principalTitle: "Kepala Sekolah",
  principalPhotoUrl: "https://picsum.photos/seed/demo-principal/800/1000",
  principalGreeting:
    "Selamat datang di website SD Cendekia Nusantara. Kami percaya setiap anak memiliki potensi yang unik. Tugas sekolah adalah menyediakan lingkungan yang aman, menantang, dan penuh dukungan agar mereka tumbuh menjadi pembelajar yang percaya diri, berkarakter, dan mampu memberi manfaat bagi lingkungan sekitarnya. Melalui website ini, kami mengundang orang tua dan masyarakat untuk mengenal program, kegiatan, prestasi, serta budaya belajar di sekolah kami.",
  address: "Jl. Pendidikan No. 10",
  village: "Sukamaju",
  district: "Harapan",
  city: "Kota Contoh",
  province: "Sumatera Barat",
  postalCode: "27000",
  phone: "0752-000000",
  whatsapp: "6281100000000",
  email: "info@demo-sekolah.id",
  operationalHours: "Senin–Jumat, 07.00–16.00 WIB",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=DEMO",
  latitude: "-0.000000",
  longitude: "100.000000",
};

const PROGRAMS = [
  {
    name: "Literasi dan Numerasi Terpadu",
    slug: "literasi-numerasi-terpadu",
    shortDescription:
      "Pembiasaan membaca, menulis, dan berhitung melalui aktivitas kontekstual.",
    description:
      "Program ini mengintegrasikan kegiatan literasi dan numerasi ke dalam pembelajaran harian. Siswa membaca buku pilihan, menulis jurnal sederhana, berdiskusi, serta memecahkan masalah matematika yang dekat dengan kehidupan sehari-hari.",
    benefits: [
      "Meningkatkan minat baca",
      "Melatih berpikir logis",
      "Membiasakan komunikasi tertulis",
      "Memperkuat pemecahan masalah",
    ],
    imageUrl: "https://picsum.photos/seed/program-1/1200/800",
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Pembelajaran Berbasis Proyek",
    slug: "pembelajaran-berbasis-proyek",
    shortDescription:
      "Siswa belajar melalui proyek nyata yang menghubungkan berbagai mata pelajaran.",
    description:
      "Setiap semester siswa menyelesaikan proyek kolaboratif, seperti membuat kebun kelas, pameran sains, kampanye hidup sehat, atau produk kreatif berbahan daur ulang.",
    benefits: [
      "Melatih kolaborasi",
      "Mengembangkan kreativitas",
      "Meningkatkan kemampuan presentasi",
      "Menghubungkan teori dengan praktik",
    ],
    imageUrl: "https://picsum.photos/seed/program-2/1200/800",
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Tahfiz dan Pendidikan Karakter",
    slug: "tahfiz-pendidikan-karakter",
    shortDescription:
      "Pembiasaan ibadah, hafalan terarah, dan penguatan akhlak dalam kegiatan sekolah.",
    description:
      "Program dilaksanakan melalui pembiasaan harian, pendampingan hafalan sesuai kemampuan siswa, refleksi karakter, dan kegiatan sosial sederhana.",
    benefits: [
      "Membangun disiplin",
      "Menguatkan akhlak",
      "Menumbuhkan tanggung jawab",
      "Membiasakan kepedulian",
    ],
    imageUrl: "https://picsum.photos/seed/program-3/1200/800",
    isFeatured: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "English Fun Learning",
    slug: "english-fun-learning",
    shortDescription:
      "Pembelajaran Bahasa Inggris komunikatif melalui permainan, lagu, cerita, dan proyek.",
    description:
      "Kegiatan dirancang sesuai usia agar siswa berani menggunakan kosakata dan ungkapan sederhana dalam situasi sehari-hari.",
    benefits: [
      "Meningkatkan kepercayaan diri",
      "Memperkaya kosakata",
      "Melatih pelafalan",
      "Mendorong komunikasi aktif",
    ],
    imageUrl: "https://picsum.photos/seed/program-4/1200/800",
    isFeatured: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Literasi Digital dan Coding Dasar",
    slug: "literasi-digital-coding-dasar",
    shortDescription:
      "Pengenalan teknologi secara aman, kreatif, dan bertanggung jawab.",
    description:
      "Siswa belajar etika digital, keamanan dasar, pengolahan informasi, presentasi, serta logika coding menggunakan media visual yang sesuai usia.",
    benefits: [
      "Meningkatkan kecakapan digital",
      "Melatih logika",
      "Mengenalkan keamanan digital",
      "Mengembangkan kreativitas teknologi",
    ],
    imageUrl: "https://picsum.photos/seed/program-5/1200/800",
    isFeatured: true,
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "Sekolah Sehat dan Ramah Lingkungan",
    slug: "sekolah-sehat-ramah-lingkungan",
    shortDescription:
      "Pembiasaan hidup sehat, pengelolaan sampah, dan kepedulian terhadap lingkungan.",
    description:
      "Program mencakup sarapan sehat, cuci tangan, pemilahan sampah, penghijauan, kebun sekolah, dan kegiatan Jumat Bersih.",
    benefits: [
      "Membentuk kebiasaan sehat",
      "Menumbuhkan kepedulian lingkungan",
      "Meningkatkan kemandirian",
      "Menjaga kebersihan sekolah",
    ],
    imageUrl: "https://picsum.photos/seed/program-6/1200/800",
    isFeatured: false,
    isActive: true,
    sortOrder: 6,
  },
];

const FACILITIES = [
  {
    name: "Ruang Kelas Nyaman",
    slug: "ruang-kelas-nyaman",
    description:
      "Ruang belajar terang, bersih, dan mendukung pembelajaran aktif.\n\nSetiap ruang kelas dilengkapi ventilasi baik, papan tulis, area pajangan karya, rak baca, serta tata meja fleksibel untuk diskusi kelompok.",
    imageUrl: "https://picsum.photos/seed/facility-1/1200/800",
    capacity: "18 ruang",
    condition: "Sangat baik",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Perpustakaan Ceria",
    slug: "perpustakaan-ceria",
    description:
      "Koleksi bacaan anak, referensi, dan ruang baca yang nyaman.\n\nPerpustakaan menjadi pusat kegiatan literasi, kunjungan kelas, peminjaman buku, membaca nyaring, dan klub baca.",
    imageUrl: "https://picsum.photos/seed/facility-2/1200/800",
    capacity: "Kapasitas 50 siswa",
    condition: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Laboratorium Komputer",
    slug: "laboratorium-komputer",
    description:
      "Ruang praktik literasi digital dan pembelajaran berbasis teknologi.\n\nLaboratorium digunakan untuk pengenalan perangkat, presentasi, pencarian informasi yang aman, dan coding visual.",
    imageUrl: "https://picsum.photos/seed/facility-3/1200/800",
    capacity: "30 perangkat",
    condition: "Jaringan terkontrol",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Ruang UKS",
    slug: "ruang-uks",
    description:
      "Layanan kesehatan dasar dan edukasi perilaku hidup bersih dan sehat.\n\nUKS dilengkapi tempat istirahat, perlengkapan pertolongan pertama, pencatatan kesehatan, dan materi edukasi kesehatan.",
    imageUrl: "https://picsum.photos/seed/facility-4/1200/800",
    capacity: "2 tempat tidur",
    condition: "Baik",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Lapangan Serbaguna",
    slug: "lapangan-serbaguna",
    description:
      "Area olahraga, upacara, permainan, dan kegiatan bersama.\n\nLapangan digunakan untuk olahraga, senam, upacara, latihan pramuka, dan kegiatan pentas luar ruang.",
    imageUrl: "https://picsum.photos/seed/facility-5/1200/800",
    capacity: "Kapasitas seluruh siswa",
    condition: null,
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "Mushala Sekolah",
    slug: "mushala-sekolah",
    description:
      "Ruang ibadah yang bersih dan nyaman untuk kegiatan keagamaan.\n\nMushala digunakan untuk ibadah berjamaah, pembiasaan doa, tahfiz, dan kegiatan keagamaan.",
    imageUrl: "https://picsum.photos/seed/facility-6/1200/800",
    capacity: "Kapasitas 180 orang",
    condition: null,
    isActive: true,
    sortOrder: 6,
  },
  {
    name: "Kantin Sehat",
    slug: "kantin-sehat",
    description:
      "Menyediakan makanan dan minuman yang lebih aman serta terpantau.\n\nKantin menerapkan daftar menu terkontrol, kebersihan rutin, pengurangan plastik sekali pakai, dan edukasi pilihan makanan sehat.",
    imageUrl: "https://picsum.photos/seed/facility-7/1200/800",
    capacity: "6 tenant terkurasi",
    condition: null,
    isActive: true,
    sortOrder: 7,
  },
  {
    name: "Area Bermain dan Taman",
    slug: "area-bermain-taman",
    description:
      "Ruang bermain aman serta area hijau untuk belajar di luar kelas.\n\nArea ini digunakan untuk permainan motorik, membaca di taman, observasi tanaman, dan kegiatan kelas luar ruang.",
    imageUrl: "https://picsum.photos/seed/facility-8/1200/800",
    capacity: "Area terbuka",
    condition: "Baik",
    isActive: true,
    sortOrder: 8,
  },
];

const TEACHERS = [
  {
    name: "Siti Rahmawati, S.Pd.",
    slug: "siti-rahmawati",
    position: "Kepala Sekolah",
    subject: "Manajemen Pendidikan Dasar",
    education: "S1 Pendidikan Guru Sekolah Dasar",
    shortBiography:
      "Memiliki pengalaman lebih dari 15 tahun dalam pendidikan dasar dan pengembangan budaya sekolah yang kolaboratif.",
    photoUrl: "https://picsum.photos/seed/teacher-1/800/1000",
    isPrincipal: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Ahmad Fauzan, S.Pd.",
    slug: "ahmad-fauzan",
    position: "Wakil Kepala Sekolah",
    subject: "Kurikulum dan Matematika",
    education: "S1 Pendidikan Matematika",
    shortBiography:
      "Berfokus pada penguatan numerasi, asesmen formatif, dan pendampingan guru.",
    photoUrl: "https://picsum.photos/seed/teacher-2/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Rina Marlina, S.Pd.",
    slug: "rina-marlina",
    position: "Guru Kelas I",
    subject: "Pembelajaran Awal",
    education: "S1 PGSD",
    shortBiography:
      "Mengembangkan pembelajaran transisi yang menyenangkan untuk membantu siswa beradaptasi dengan lingkungan sekolah.",
    photoUrl: "https://picsum.photos/seed/teacher-3/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Dewi Anggraini, S.Pd.",
    slug: "dewi-anggraini",
    position: "Guru Kelas II",
    subject: "Literasi Dasar",
    education: "S1 PGSD",
    shortBiography:
      "Aktif mengembangkan kegiatan membaca nyaring, jurnal siswa, dan pembelajaran tematik.",
    photoUrl: "https://picsum.photos/seed/teacher-4/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Budi Santoso, S.Pd.",
    slug: "budi-santoso",
    position: "Guru Kelas III",
    subject: "Sains Dasar",
    education: "S1 PGSD",
    shortBiography:
      "Mendorong siswa belajar melalui eksperimen sederhana dan pengamatan lingkungan.",
    photoUrl: "https://picsum.photos/seed/teacher-5/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "Nur Aisyah, S.Pd.",
    slug: "nur-aisyah",
    position: "Guru Kelas IV",
    subject: "Bahasa Indonesia",
    education: "S1 Pendidikan Bahasa Indonesia",
    shortBiography:
      "Membimbing siswa mengembangkan keterampilan membaca kritis, menulis, dan presentasi.",
    photoUrl: "https://picsum.photos/seed/teacher-6/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    name: "Rizky Pratama, S.Pd.",
    slug: "rizky-pratama",
    position: "Guru Kelas V",
    subject: "Matematika dan Proyek",
    education: "S1 Pendidikan Matematika",
    shortBiography:
      "Mengintegrasikan pemecahan masalah, proyek, dan penggunaan media digital dalam pembelajaran.",
    photoUrl: "https://picsum.photos/seed/teacher-7/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 7,
  },
  {
    name: "Fitri Handayani, S.Pd.",
    slug: "fitri-handayani",
    position: "Guru Kelas VI",
    subject: "Persiapan Lanjutan",
    education: "S1 PGSD",
    shortBiography:
      "Mendampingi siswa membangun kemandirian belajar dan kesiapan melanjutkan ke jenjang berikutnya.",
    photoUrl: "https://picsum.photos/seed/teacher-8/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 8,
  },
  {
    name: "M. Ilham, S.Pd.I.",
    slug: "m-ilham",
    position: "Guru Pendidikan Agama",
    subject: "Pendidikan Agama dan Tahfiz",
    education: "S1 Pendidikan Agama Islam",
    shortBiography:
      "Membina pembiasaan ibadah, tahfiz, akhlak, dan kegiatan sosial keagamaan.",
    photoUrl: "https://picsum.photos/seed/teacher-9/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 9,
  },
  {
    name: "Nadia Putri, S.Kom.",
    slug: "nadia-putri",
    position: "Guru TIK",
    subject: "Literasi Digital dan Coding",
    education: "S1 Sistem Informasi",
    shortBiography:
      "Mengenalkan teknologi secara aman, kreatif, dan sesuai tahap perkembangan siswa.",
    photoUrl: "https://picsum.photos/seed/teacher-10/800/1000",
    isPrincipal: false,
    isActive: true,
    sortOrder: 10,
  },
];

const ACHIEVEMENTS = [
  {
    title: "Juara 1 Olimpiade Matematika Tingkat Kota",
    slug: "juara-1-olimpiade-matematika-kota",
    achievementType: AchievementType.STUDENT,
    category: "Akademik",
    competitionLevel: CompetitionLevel.CITY,
    rank: "Juara 1",
    achievementDate: dateOnly("2026-05-18"),
    description:
      "Tim siswa kelas V meraih juara pertama setelah menyelesaikan rangkaian soal pemecahan masalah numerasi.",
    imageUrl: "https://picsum.photos/seed/achievement-1/1200/800",
    isPublished: true,
  },
  {
    title: "Juara 2 Lomba Mendongeng Bahasa Indonesia",
    slug: "juara-2-lomba-mendongeng",
    achievementType: AchievementType.STUDENT,
    category: "Seni dan Literasi",
    competitionLevel: CompetitionLevel.DISTRICT,
    rank: "Juara 2",
    achievementDate: dateOnly("2026-04-22"),
    description:
      "Perwakilan kelas IV menampilkan cerita rakyat dengan penghayatan dan artikulasi yang baik.",
    imageUrl: "https://picsum.photos/seed/achievement-2/1200/800",
    isPublished: true,
  },
  {
    title: "Sekolah Adiwiyata Tingkat Kota",
    slug: "sekolah-adiwiyata-kota",
    achievementType: AchievementType.SCHOOL,
    category: "Lingkungan",
    competitionLevel: CompetitionLevel.CITY,
    rank: "Penghargaan",
    achievementDate: dateOnly("2026-03-12"),
    description:
      "Penghargaan diberikan atas program pengelolaan sampah, kebun sekolah, dan pembiasaan ramah lingkungan.",
    imageUrl: "https://picsum.photos/seed/achievement-3/1200/800",
    isPublished: true,
  },
  {
    title: "Juara 1 Futsal Pelajar SD",
    slug: "juara-1-futsal-pelajar-sd",
    achievementType: AchievementType.STUDENT,
    category: "Olahraga",
    competitionLevel: CompetitionLevel.DISTRICT,
    rank: "Juara 1",
    achievementDate: dateOnly("2026-02-08"),
    description:
      "Tim futsal sekolah menunjukkan kerja sama, disiplin, dan sportivitas sepanjang turnamen.",
    imageUrl: "https://picsum.photos/seed/achievement-4/1200/800",
    isPublished: true,
  },
  {
    title: "Guru Inovatif Tingkat Kabupaten",
    slug: "guru-inovatif-kabupaten",
    achievementType: AchievementType.TEACHER,
    category: "Inovasi Pembelajaran",
    competitionLevel: CompetitionLevel.CITY,
    rank: "Finalis Terbaik",
    achievementDate: dateOnly("2025-11-20"),
    description:
      "Guru sekolah masuk finalis melalui praktik pembelajaran proyek berbasis lingkungan.",
    imageUrl: "https://picsum.photos/seed/achievement-5/1200/800",
    isPublished: true,
  },
  {
    title: "Medali Perak Kompetisi Sains Dasar",
    slug: "medali-perak-kompetisi-sains",
    achievementType: AchievementType.STUDENT,
    category: "Sains",
    competitionLevel: CompetitionLevel.PROVINCE,
    rank: "Medali Perak",
    achievementDate: dateOnly("2025-10-14"),
    description:
      "Siswa kelas VI meraih medali perak dalam kompetisi sains dasar tingkat provinsi.",
    imageUrl: "https://picsum.photos/seed/achievement-6/1200/800",
    isPublished: true,
  },
  {
    title: "Juara Harapan 1 Paduan Suara Anak",
    slug: "juara-harapan-paduan-suara",
    achievementType: AchievementType.STUDENT,
    category: "Seni",
    competitionLevel: CompetitionLevel.CITY,
    rank: "Harapan 1",
    achievementDate: dateOnly("2025-09-02"),
    description:
      "Kelompok paduan suara membawakan dua lagu daerah dengan aransemen sederhana.",
    imageUrl: "https://picsum.photos/seed/achievement-7/1200/800",
    isPublished: true,
  },
  {
    title: "Penghargaan Sekolah Ramah Anak",
    slug: "penghargaan-sekolah-ramah-anak",
    achievementType: AchievementType.SCHOOL,
    category: "Budaya Sekolah",
    competitionLevel: CompetitionLevel.CITY,
    rank: "Penghargaan",
    achievementDate: dateOnly("2025-07-23"),
    description:
      "Sekolah mendapat apresiasi atas kebijakan perlindungan anak dan lingkungan belajar yang aman.",
    imageUrl: "https://picsum.photos/seed/achievement-8/1200/800",
    isPublished: true,
  },
];

const EXTRACURRICULARS = [
  {
    name: "Pramuka",
    slug: "pramuka",
    description:
      "Pembinaan kemandirian, kepemimpinan, dan kerja sama.\n\nKegiatan meliputi latihan baris-berbaris, keterampilan tali-temali, permainan kelompok, penjelajahan, dan bakti sosial.",
    schedule: "Jumat, 14.00–15.30",
    coach: "Kak Ahmad Fauzan",
    targetClasses: ["Kelas III", "Kelas IV", "Kelas V", "Kelas VI"],
    imageUrl: "https://picsum.photos/seed/extra-1/1200/800",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Futsal",
    slug: "futsal",
    description:
      "Latihan teknik dasar, kebugaran, dan sportivitas.\n\nSiswa berlatih kontrol bola, passing, strategi sederhana, kebugaran, dan pertandingan persahabatan.",
    schedule: "Selasa, 15.00–16.30",
    coach: "Budi Santoso, S.Pd.",
    targetClasses: ["Kelas III", "Kelas IV", "Kelas V", "Kelas VI"],
    imageUrl: "https://picsum.photos/seed/extra-2/1200/800",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Tahfiz",
    slug: "tahfiz",
    description:
      "Pendampingan hafalan sesuai kemampuan dan target bertahap.\n\nKegiatan dilakukan dalam kelompok kecil dengan murajaah, hafalan baru, dan pembiasaan adab.",
    schedule: "Rabu, 14.00–15.30",
    coach: "M. Ilham, S.Pd.I.",
    targetClasses: [
      "Kelas I",
      "Kelas II",
      "Kelas III",
      "Kelas IV",
      "Kelas V",
      "Kelas VI",
    ],
    imageUrl: "https://picsum.photos/seed/extra-3/1200/800",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Sains Club",
    slug: "sains-club",
    description:
      "Eksperimen sederhana dan eksplorasi fenomena alam.\n\nSiswa melakukan percobaan aman, membuat catatan pengamatan, dan mengikuti tantangan sains.",
    schedule: "Kamis, 14.00–15.30",
    coach: "Budi Santoso, S.Pd.",
    targetClasses: ["Kelas IV", "Kelas V", "Kelas VI"],
    imageUrl: "https://picsum.photos/seed/extra-4/1200/800",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Coding Junior",
    slug: "coding-junior",
    description:
      "Belajar logika dan coding visual secara menyenangkan.\n\nKegiatan menggunakan blok pemrograman, permainan logika, dan pembuatan animasi sederhana.",
    schedule: "Kamis, 15.00–16.00",
    coach: "Nadia Putri, S.Kom.",
    targetClasses: ["Kelas IV", "Kelas V", "Kelas VI"],
    imageUrl: "https://picsum.photos/seed/extra-5/1200/800",
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "Seni Tari",
    slug: "seni-tari",
    description:
      "Pengembangan ekspresi, koordinasi, dan apresiasi budaya.\n\nSiswa mempelajari gerak dasar, tari daerah, dan persiapan pertunjukan sekolah.",
    schedule: "Senin, 14.00–15.30",
    coach: "Pelatih Seni Sekolah",
    targetClasses: [
      "Kelas I",
      "Kelas II",
      "Kelas III",
      "Kelas IV",
      "Kelas V",
      "Kelas VI",
    ],
    imageUrl: "https://picsum.photos/seed/extra-6/1200/800",
    isActive: true,
    sortOrder: 6,
  },
  {
    name: "Paduan Suara",
    slug: "paduan-suara",
    description:
      "Latihan vokal, harmoni, dan penampilan kelompok.\n\nSiswa berlatih pernapasan, artikulasi, lagu nasional, daerah, dan lagu anak.",
    schedule: "Rabu, 15.00–16.00",
    coach: "Nur Aisyah, S.Pd.",
    targetClasses: ["Kelas III", "Kelas IV", "Kelas V", "Kelas VI"],
    imageUrl: "https://picsum.photos/seed/extra-7/1200/800",
    isActive: true,
    sortOrder: 7,
  },
  {
    name: "Dokter Kecil",
    slug: "dokter-kecil",
    description:
      "Edukasi kesehatan dasar dan kebiasaan hidup bersih.\n\nKegiatan meliputi pertolongan pertama sederhana, kebersihan diri, kampanye cuci tangan, dan dukungan kegiatan UKS.",
    schedule: "Jumat, 13.30–14.30",
    coach: "Tim UKS",
    targetClasses: ["Kelas IV", "Kelas V", "Kelas VI"],
    imageUrl: "https://picsum.photos/seed/extra-8/1200/800",
    isActive: true,
    sortOrder: 8,
  },
];

const POST_CATEGORIES = [
  {
    name: "Kegiatan Sekolah",
    slug: "kegiatan-sekolah",
    description: "Berita aktivitas pembelajaran, acara, dan kegiatan sekolah.",
  },
  {
    name: "Prestasi",
    slug: "prestasi",
    description: "Publikasi prestasi siswa, guru, dan sekolah.",
  },
  {
    name: "Literasi",
    slug: "literasi",
    description: "Program membaca, menulis, dan pengembangan budaya literasi.",
  },
  {
    name: "Lingkungan",
    slug: "lingkungan",
    description: "Kegiatan sekolah sehat dan ramah lingkungan.",
  },
  {
    name: "PPDB",
    slug: "ppdb",
    description:
      "Informasi dan pembaruan terkait penerimaan peserta didik baru.",
  },
];

const POSTS = [
  {
    title: "Pekan Literasi: Siswa Membaca, Menulis, dan Berbagi Cerita",
    slug: "pekan-literasi-siswa-berbagi-cerita",
    categorySlug: "literasi",
    excerpt:
      "Pekan Literasi menghadirkan kegiatan membaca nyaring, pertukaran buku, dan panggung cerita siswa.",
    content:
      "SD Cendekia Nusantara menyelenggarakan Pekan Literasi selama lima hari. Setiap kelas mengikuti kegiatan membaca nyaring, menulis jurnal, pertukaran buku, dan panggung cerita. Orang tua juga dilibatkan melalui program membaca bersama di rumah. Kegiatan ditutup dengan pameran karya tulis dan ilustrasi siswa.",
    status: PostStatus.PUBLISHED,
    publishedAt: dateTimeWib("2026-07-25 09:00"),
    featuredImageUrl: "https://picsum.photos/seed/news-1/1200/675",
  },
  {
    title: "Panen Perdana Kebun Sekolah",
    slug: "panen-perdana-kebun-sekolah",
    categorySlug: "lingkungan",
    excerpt:
      "Siswa memanen sayuran dari kebun sekolah sebagai bagian dari proyek pembelajaran lingkungan.",
    content:
      "Siswa kelas IV dan V melaksanakan panen perdana sayuran yang ditanam selama delapan minggu. Mereka belajar mengukur pertumbuhan tanaman, mencatat kebutuhan air, dan berdiskusi tentang pangan sehat. Hasil panen digunakan dalam kegiatan memasak sederhana dan dibagikan kepada warga sekolah.",
    status: PostStatus.PUBLISHED,
    publishedAt: dateTimeWib("2026-07-18 10:00"),
    featuredImageUrl: "https://picsum.photos/seed/news-2/1200/675",
  },
  {
    title: "Masa Pengenalan Lingkungan Sekolah Berjalan Ramah Anak",
    slug: "mpls-ramah-anak",
    categorySlug: "kegiatan-sekolah",
    excerpt:
      "MPLS membantu siswa baru mengenal guru, teman, ruang sekolah, dan kebiasaan belajar.",
    content:
      "Kegiatan pengenalan lingkungan sekolah dilaksanakan tanpa perpeloncoan. Siswa mengikuti permainan perkenalan, tur fasilitas, simulasi keselamatan, membaca bersama, dan kegiatan seni. Guru mendampingi proses adaptasi agar siswa merasa aman dan percaya diri.",
    status: PostStatus.PUBLISHED,
    publishedAt: dateTimeWib("2026-07-13 08:30"),
    featuredImageUrl: "https://picsum.photos/seed/news-3/1200/675",
  },
  {
    title: "Tim Futsal Raih Juara Pertama Tingkat Kecamatan",
    slug: "tim-futsal-juara-kecamatan",
    categorySlug: "prestasi",
    excerpt:
      "Tim futsal sekolah meraih juara pertama dengan menjunjung sportivitas.",
    content:
      "Tim futsal SD Cendekia Nusantara meraih juara pertama dalam turnamen antarsekolah tingkat kecamatan. Selain hasil pertandingan, pelatih menekankan disiplin, komunikasi, dan penghormatan kepada lawan. Sekolah menyampaikan apresiasi kepada siswa, pelatih, dan orang tua.",
    status: PostStatus.PUBLISHED,
    publishedAt: dateTimeWib("2026-06-20 14:00"),
    featuredImageUrl: "https://picsum.photos/seed/news-4/1200/675",
  },
  {
    title: "Workshop Pembelajaran Berbasis Proyek untuk Guru",
    slug: "workshop-pembelajaran-berbasis-proyek",
    categorySlug: "kegiatan-sekolah",
    excerpt:
      "Guru mengikuti pelatihan untuk merancang proyek yang terukur dan sesuai usia siswa.",
    content:
      "Pelatihan internal membahas perencanaan proyek, asesmen formatif, dokumentasi proses, dan presentasi karya. Guru bekerja dalam kelompok untuk menyusun proyek lintas mata pelajaran yang akan diterapkan pada semester berikutnya.",
    status: PostStatus.PUBLISHED,
    publishedAt: dateTimeWib("2026-06-08 13:00"),
    featuredImageUrl: "https://picsum.photos/seed/news-5/1200/675",
  },
  {
    title: "Siswa Kelas VI Gelar Pameran Sains",
    slug: "pameran-sains-kelas-vi",
    categorySlug: "kegiatan-sekolah",
    excerpt:
      "Pameran menampilkan model energi, penyaringan air, dan eksperimen sederhana.",
    content:
      "Siswa kelas VI mempresentasikan proyek sains kepada adik kelas dan orang tua. Setiap kelompok menjelaskan tujuan, proses, hasil pengamatan, dan perbaikan yang dilakukan. Kegiatan ini melatih komunikasi ilmiah serta kerja sama tim.",
    status: PostStatus.PUBLISHED,
    publishedAt: dateTimeWib("2026-05-28 09:30"),
    featuredImageUrl: "https://picsum.photos/seed/news-6/1200/675",
  },
  {
    title: "Gerakan Jumat Bersih dan Pilah Sampah",
    slug: "jumat-bersih-pilah-sampah",
    categorySlug: "lingkungan",
    excerpt:
      "Warga sekolah memperkuat kebiasaan menjaga kebersihan dan memilah sampah.",
    content:
      "Setiap Jumat, kelas bergiliran melakukan perawatan area sekolah. Siswa memilah sampah organik dan anorganik, merawat tanaman, serta mengevaluasi kebersihan kelas. Program didampingi guru dan petugas sekolah.",
    status: PostStatus.PUBLISHED,
    publishedAt: dateTimeWib("2026-05-16 11:00"),
    featuredImageUrl: "https://picsum.photos/seed/news-7/1200/675",
  },
  {
    title: "Informasi Awal PPDB Tahun Ajaran 2027/2028",
    slug: "informasi-awal-ppdb-2027-2028",
    categorySlug: "ppdb",
    excerpt:
      "Sekolah menyiapkan informasi jadwal, persyaratan, alur, dan kontak PPDB.",
    content:
      "Halaman informasi PPDB Tahun Ajaran 2027/2028 telah disiapkan. Pendaftaran akan dilakukan melalui kanal eksternal yang diumumkan sekolah. Orang tua dapat mempelajari jadwal, persyaratan, estimasi biaya, dan menghubungi panitia melalui WhatsApp.",
    status: PostStatus.PUBLISHED,
    publishedAt: dateTimeWib("2026-08-01 08:00"),
    featuredImageUrl: "https://picsum.photos/seed/news-8/1200/675",
  },
];

const ANNOUNCEMENTS = [
  {
    title: "Jadwal Awal Tahun Ajaran 2026/2027",
    slug: "jadwal-awal-tahun-ajaran-2026-2027",
    content:
      "Kegiatan belajar efektif dimulai Senin, 13 Juli 2026. Siswa hadir paling lambat pukul 07.00 WIB.",
    priority: AnnouncementPriority.IMPORTANT,
    startDate: dateTimeWib("2026-07-01 00:00"),
    endDate: dateTimeWib("2026-07-20 23:59"),
    isPinned: true,
    isActive: true,
    attachmentUrl: null,
  },
  {
    title: "Pengumpulan Data Kontak Orang Tua",
    slug: "pengumpulan-data-kontak-orang-tua",
    content:
      "Orang tua diminta memastikan nomor WhatsApp aktif telah tercatat melalui wali kelas.",
    priority: AnnouncementPriority.NORMAL,
    startDate: dateTimeWib("2026-07-13 00:00"),
    endDate: dateTimeWib("2026-08-15 23:59"),
    isPinned: false,
    isActive: true,
    attachmentUrl: null,
  },
  {
    title: "Simulasi Evakuasi dan Keselamatan",
    slug: "simulasi-evakuasi-keselamatan",
    content:
      "Simulasi evakuasi sekolah dilaksanakan Jumat, 14 Agustus 2026. Siswa menggunakan seragam olahraga.",
    priority: AnnouncementPriority.IMPORTANT,
    startDate: dateTimeWib("2026-08-03 00:00"),
    endDate: dateTimeWib("2026-08-14 23:59"),
    isPinned: true,
    isActive: true,
    attachmentUrl: "/demo/documents/surat-simulasi-evakuasi.pdf",
  },
  {
    title: "Informasi Awal PPDB 2027/2028",
    slug: "informasi-awal-ppdb-2027-2028",
    content:
      "Informasi lengkap PPDB akan diumumkan melalui website dan kanal resmi sekolah. Tidak ada pendaftaran melalui pihak tidak resmi.",
    priority: AnnouncementPriority.URGENT,
    startDate: dateTimeWib("2026-08-01 00:00"),
    endDate: dateTimeWib("2027-02-28 23:59"),
    isPinned: true,
    isActive: true,
    attachmentUrl: "/demo/documents/brosur-ppdb-2027-2028.pdf",
  },
];

const FAQS = [
  {
    id: "9f7e381c-9606-56e5-949c-096062caf85c",
    category: "Profil Sekolah",
    question: "Apa keunggulan utama SD Cendekia Nusantara?",
    answer:
      "Sekolah menekankan pembelajaran aktif, penguatan karakter, literasi dan numerasi, literasi digital, pengembangan minat bakat, serta lingkungan belajar yang aman dan ramah anak.",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "17b26fe8-8a60-57e2-a81f-eb129b049670",
    category: "Pembelajaran",
    question: "Kurikulum apa yang digunakan?",
    answer:
      "Sekolah mengikuti kurikulum nasional yang berlaku dan memperkaya pembelajaran melalui proyek, kegiatan literasi, penguatan karakter, serta program unggulan sekolah.",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "d04c0334-e080-5909-b0e8-72f14c6b6fe7",
    category: "Pembelajaran",
    question: "Bagaimana sekolah memantau perkembangan siswa?",
    answer:
      "Guru menggunakan observasi, tugas, proyek, asesmen formatif, dan komunikasi berkala dengan orang tua untuk memantau perkembangan akademik maupun karakter.",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "1a985709-b467-5c22-ad24-bfcb375cfe6e",
    category: "Fasilitas",
    question: "Apakah sekolah memiliki perpustakaan dan laboratorium komputer?",
    answer:
      "Ya. Sekolah memiliki perpustakaan, laboratorium komputer, UKS, lapangan serbaguna, mushala, kantin sehat, serta area bermain dan taman.",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "cacfbfe7-6b88-5ee2-a711-794b13e8bd01",
    category: "Kegiatan",
    question: "Ekstrakurikuler apa saja yang tersedia?",
    answer:
      "Pilihan kegiatan antara lain pramuka, futsal, tahfiz, sains, coding, seni tari, paduan suara, dan dokter kecil.",
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "363c679a-6181-5f35-916a-fcfe0650258d",
    category: "Kegiatan",
    question: "Apakah semua siswa wajib mengikuti ekstrakurikuler?",
    answer:
      "Ketentuan dapat berbeda sesuai kebijakan sekolah. Dalam data demo ini, siswa memilih kegiatan berdasarkan minat, usia, dan ketersediaan kuota.",
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "a5d2ef11-16d3-5861-8d5e-dfd9c7d175a5",
    category: "Komunikasi",
    question: "Bagaimana orang tua berkomunikasi dengan sekolah?",
    answer:
      "Orang tua dapat menghubungi wali kelas, nomor WhatsApp resmi, telepon sekolah, email, atau formulir kontak pada website.",
    isActive: true,
    sortOrder: 7,
  },
  {
    id: "36b4180d-2ccb-5fc0-a950-32925a4a1585",
    category: "Keamanan",
    question: "Bagaimana sekolah menjaga keamanan siswa?",
    answer:
      "Sekolah menerapkan prosedur penjemputan, pengawasan area, simulasi keselamatan, pencatatan tamu, serta kebijakan perlindungan anak.",
    isActive: true,
    sortOrder: 8,
  },
  {
    id: "afc0951f-1fa0-5a62-93b0-280548af638f",
    category: "PPDB",
    question: "Apakah pendaftaran PPDB dilakukan di website ini?",
    answer:
      "Tidak. Website hanya menampilkan informasi PPDB. Pendaftaran diarahkan ke WhatsApp, Google Form, atau sistem eksternal resmi yang diumumkan sekolah.",
    isActive: true,
    sortOrder: 9,
  },
  {
    id: "a19d2b48-1295-5919-816e-85e8cdfba9ca",
    category: "PPDB",
    question: "Dokumen apa yang biasanya dibutuhkan untuk PPDB?",
    answer:
      "Contoh dokumen antara lain kartu keluarga, akta kelahiran, identitas orang tua, dan pas foto. Daftar resmi harus mengikuti pengumuman sekolah.",
    isActive: true,
    sortOrder: 10,
  },
  {
    id: "acae6774-dc5c-53a9-a4ff-585cd99550c7",
    category: "PPDB",
    question: "Apakah tersedia biaya PPDB?",
    answer:
      "Estimasi biaya dapat ditampilkan pada halaman PPDB apabila sekolah memilih untuk mempublikasikannya. Nilai pada showcase adalah data fiktif.",
    isActive: true,
    sortOrder: 11,
  },
  {
    id: "dbbec2bb-6202-58d8-92ee-2819b281507b",
    category: "Kunjungan",
    question: "Apakah orang tua dapat mengunjungi sekolah?",
    answer:
      "Kunjungan dapat dijadwalkan melalui kontak resmi sekolah agar petugas dapat menyiapkan pendampingan dan informasi yang dibutuhkan.",
    isActive: true,
    sortOrder: 12,
  },
];

const TESTIMONIALS = [
  {
    id: "3afc77ad-adb8-586e-a642-404f7d6eff09",
    name: "Rani Puspitasari",
    role: "Orang Tua Siswa Kelas III",
    content:
      "Anak kami menjadi lebih percaya diri untuk membaca dan bercerita. Guru juga rutin memberikan informasi perkembangan belajar dengan bahasa yang mudah dipahami.",
    photoUrl: "https://picsum.photos/seed/testimonial-1/800/1000",
    isPublished: true,
    sortOrder: 1,
  },
  {
    id: "25392b78-c6f5-53dd-bb40-079566dab7cd",
    name: "Dedi Kurniawan",
    role: "Orang Tua Siswa Kelas V",
    content:
      "Kami menyukai keseimbangan antara pembelajaran akademik, karakter, olahraga, dan proyek. Anak merasa senang datang ke sekolah.",
    photoUrl: "https://picsum.photos/seed/testimonial-2/800/1000",
    isPublished: true,
    sortOrder: 2,
  },
  {
    id: "12b8b29b-8e35-5b5b-be9c-bebcf1f61a91",
    name: "Maya Lestari",
    role: "Orang Tua Siswa Kelas I",
    content:
      "Masa adaptasi anak berjalan baik karena guru sabar dan lingkungan kelas terasa aman. Komunikasi dengan wali kelas juga responsif.",
    photoUrl: "https://picsum.photos/seed/testimonial-3/800/1000",
    isPublished: true,
    sortOrder: 3,
  },
  {
    id: "bb0f1d00-c081-554d-8824-c3a74caa96d0",
    name: "Arif Hidayat",
    role: "Alumni",
    content:
      "Pengalaman mengikuti pramuka dan pameran sains membantu saya berani tampil dan bekerja dalam kelompok.",
    photoUrl: "https://picsum.photos/seed/testimonial-4/800/1000",
    isPublished: true,
    sortOrder: 4,
  },
  {
    id: "50e7fffb-272c-596d-b5b8-37a515fa8627",
    name: "Nina Oktaviani",
    role: "Orang Tua Siswa Kelas VI",
    content:
      "Sekolah membantu anak belajar mandiri menjelang jenjang berikutnya tanpa mengabaikan kenyamanan dan perkembangan sosial.",
    photoUrl: "https://picsum.photos/seed/testimonial-5/800/1000",
    isPublished: true,
    sortOrder: 5,
  },
  {
    id: "15b00250-040d-51bd-bc00-07d709652318",
    name: "Rahmat Syahputra",
    role: "Tokoh Masyarakat",
    content:
      "Sekolah aktif melibatkan lingkungan sekitar dalam kegiatan kebersihan, literasi, dan sosial.",
    photoUrl: "https://picsum.photos/seed/testimonial-6/800/1000",
    isPublished: true,
    sortOrder: 6,
  },
];

const GALLERY_ALBUMS = [
  {
    title: "Masa Pengenalan Lingkungan Sekolah 2026",
    slug: "mpls-2026",
    description: "Kegiatan pengenalan lingkungan sekolah yang ramah anak.",
    eventDate: dateOnly("2026-07-13"),
    coverImageUrl: "https://picsum.photos/seed/album-1/1200/800",
    isPublished: true,
  },
  {
    title: "Pekan Literasi 2026",
    slug: "pekan-literasi-2026",
    description:
      "Dokumentasi membaca nyaring, pertukaran buku, dan panggung cerita.",
    eventDate: dateOnly("2026-07-25"),
    coverImageUrl: "https://picsum.photos/seed/album-2/1200/800",
    isPublished: true,
  },
  {
    title: "Pameran Sains Kelas VI",
    slug: "pameran-sains-kelas-vi",
    description: "Presentasi proyek sains dan eksperimen siswa.",
    eventDate: dateOnly("2026-05-28"),
    coverImageUrl: "https://picsum.photos/seed/album-3/1200/800",
    isPublished: true,
  },
  {
    title: "Panen Kebun Sekolah",
    slug: "panen-kebun-sekolah",
    description: "Kegiatan panen dan pembelajaran lingkungan.",
    eventDate: dateOnly("2026-07-18"),
    coverImageUrl: "https://picsum.photos/seed/album-4/1200/800",
    isPublished: true,
  },
  {
    title: "Pentas Seni dan Kreativitas",
    slug: "pentas-seni-kreativitas",
    description: "Penampilan tari, paduan suara, musik, dan pameran karya.",
    eventDate: dateOnly("2026-06-15"),
    coverImageUrl: "https://picsum.photos/seed/album-5/1200/800",
    isPublished: true,
  },
];

const GALLERY_MEDIA = [
  {
    id: "9d5eac70-fb19-57f5-a1f9-d44e3044bbb1",
    albumSlug: "mpls-2026",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-1/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-1/1400/900",
    caption: "Siswa baru mengikuti permainan perkenalan.",
    altText: "Siswa mengikuti kegiatan perkenalan di halaman sekolah",
    sortOrder: 1,
  },
  {
    id: "99ae1e5f-4c05-59ec-b2ec-ccf37cc7d723",
    albumSlug: "mpls-2026",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-2/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-2/1400/900",
    caption: "Tur fasilitas bersama guru pendamping.",
    altText: "Guru mendampingi siswa mengenal fasilitas sekolah",
    sortOrder: 2,
  },
  {
    id: "fcd52ce2-3eed-5780-a909-723cec8c977f",
    albumSlug: "mpls-2026",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-3/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-3/1400/900",
    caption: "Kegiatan membaca bersama di kelas.",
    altText: "Siswa membaca bersama pada masa pengenalan sekolah",
    sortOrder: 3,
  },
  {
    id: "38e77c5c-ef3e-5355-967b-b550621ceb35",
    albumSlug: "pekan-literasi-2026",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-4/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-4/1400/900",
    caption: "Membaca nyaring oleh guru.",
    altText: "Guru membaca buku cerita di depan siswa",
    sortOrder: 1,
  },
  {
    id: "08f2308f-f0e4-5323-9553-4f58c05ae039",
    albumSlug: "pekan-literasi-2026",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-5/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-5/1400/900",
    caption: "Panggung cerita siswa.",
    altText: "Siswa menceritakan kembali buku yang dibaca",
    sortOrder: 2,
  },
  {
    id: "139c1142-fe91-5272-b1a9-e3d4365449fe",
    albumSlug: "pekan-literasi-2026",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-6/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-6/1400/900",
    caption: "Pameran jurnal dan ilustrasi.",
    altText: "Pameran karya literasi siswa",
    sortOrder: 3,
  },
  {
    id: "f53d03bd-012f-58ac-add2-581f451035f4",
    albumSlug: "pameran-sains-kelas-vi",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-7/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-7/1400/900",
    caption: "Model penyaringan air sederhana.",
    altText: "Siswa menjelaskan model penyaringan air",
    sortOrder: 1,
  },
  {
    id: "0592827a-f47f-5505-a383-a9b18762d8de",
    albumSlug: "pameran-sains-kelas-vi",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-8/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-8/1400/900",
    caption: "Presentasi model energi.",
    altText: "Kelompok siswa mempresentasikan model energi",
    sortOrder: 2,
  },
  {
    id: "f0bc90a3-fe24-5cdf-96d1-0174b6be1f91",
    albumSlug: "pameran-sains-kelas-vi",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-9/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-9/1400/900",
    caption: "Pengunjung mengamati hasil eksperimen.",
    altText: "Siswa dan orang tua melihat pameran sains",
    sortOrder: 3,
  },
  {
    id: "328c7d51-fabe-5160-866e-1ee630341af6",
    albumSlug: "panen-kebun-sekolah",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-10/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-10/1400/900",
    caption: "Siswa merawat tanaman.",
    altText: "Siswa menyiram tanaman di kebun sekolah",
    sortOrder: 1,
  },
  {
    id: "dc4a378f-1b90-5647-baa9-9e9d198631a3",
    albumSlug: "panen-kebun-sekolah",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-11/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-11/1400/900",
    caption: "Panen sayuran bersama.",
    altText: "Siswa memanen sayuran bersama guru",
    sortOrder: 2,
  },
  {
    id: "89b2123f-8960-51cd-af0d-b7db15978c8e",
    albumSlug: "panen-kebun-sekolah",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-12/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-12/1400/900",
    caption: "Pencatatan hasil panen.",
    altText: "Siswa mencatat berat hasil panen",
    sortOrder: 3,
  },
  {
    id: "d1d97580-c7d4-59f9-b97e-2cd986316759",
    albumSlug: "pentas-seni-kreativitas",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-13/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-13/1400/900",
    caption: "Penampilan tari daerah.",
    altText: "Siswa menampilkan tari daerah di panggung sekolah",
    sortOrder: 1,
  },
  {
    id: "66b43a29-710d-59e4-8895-7ce20ddc931b",
    albumSlug: "pentas-seni-kreativitas",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-14/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-14/1400/900",
    caption: "Paduan suara siswa.",
    altText: "Kelompok paduan suara tampil di acara sekolah",
    sortOrder: 2,
  },
  {
    id: "db6a7a95-24ad-5fc2-b58e-1639827b32a4",
    albumSlug: "pentas-seni-kreativitas",
    mediaType: MediaType.IMAGE,
    fileUrl: "https://picsum.photos/seed/gallery-15/1400/900",
    thumbnailUrl: "https://picsum.photos/seed/gallery-15/1400/900",
    caption: "Pameran karya kreatif.",
    altText: "Karya seni siswa dipajang pada pameran",
    sortOrder: 3,
  },
];

const DOWNLOAD_DOCUMENTS = [
  {
    name: "Kalender Pendidikan 2026/2027",
    slug: "kalender-pendidikan-2026-2027",
    category: "Akademik",
    description:
      "Kalender kegiatan belajar, asesmen, libur, dan agenda sekolah.",
    fileUrl: "/demo/documents/kalender-pendidikan-2026-2027.pdf",
    fileName: "kalender-pendidikan-2026-2027.pdf",
    fileType: "application/pdf",
    isActive: true,
  },
  {
    name: "Panduan Orang Tua dan Siswa",
    slug: "panduan-orang-tua-siswa",
    category: "Panduan",
    description:
      "Ringkasan kebiasaan sekolah, komunikasi, keselamatan, dan tata tertib.",
    fileUrl: "/demo/documents/panduan-orang-tua-siswa.pdf",
    fileName: "panduan-orang-tua-siswa.pdf",
    fileType: "application/pdf",
    isActive: true,
  },
  {
    name: "Brosur PPDB 2027/2028",
    slug: "brosur-ppdb-2027-2028",
    category: "PPDB",
    description:
      "Brosur informasi program, jadwal, persyaratan, dan kontak PPDB.",
    fileUrl: "/demo/documents/brosur-ppdb-2027-2028.pdf",
    fileName: "brosur-ppdb-2027-2028.pdf",
    fileType: "application/pdf",
    isActive: true,
  },
  {
    name: "Daftar Ekstrakurikuler",
    slug: "daftar-ekstrakurikuler",
    category: "Kegiatan",
    description: "Informasi pilihan kegiatan, jadwal, dan kelompok kelas.",
    fileUrl: "/demo/documents/daftar-ekstrakurikuler.pdf",
    fileName: "daftar-ekstrakurikuler.pdf",
    fileType: "application/pdf",
    isActive: true,
  },
  {
    name: "Kebijakan Privasi Website",
    slug: "kebijakan-privasi-website",
    category: "Kebijakan",
    description:
      "Penjelasan penggunaan data formulir kontak dan dokumentasi publik.",
    fileUrl: "/demo/documents/kebijakan-privasi.pdf",
    fileName: "kebijakan-privasi.pdf",
    fileType: "application/pdf",
    isActive: true,
  },
];

const SOCIAL_LINKS = [
  {
    platform: "INSTAGRAM",
    label: "Instagram",
    url: "https://instagram.com/sdcendekia.demo",
    icon: "instagram",
    isActive: true,
    sortOrder: 1,
  },
  {
    platform: "FACEBOOK",
    label: "Facebook",
    url: "https://facebook.com/sdcendekia.demo",
    icon: "facebook",
    isActive: true,
    sortOrder: 2,
  },
  {
    platform: "YOUTUBE",
    label: "YouTube",
    url: "https://youtube.com/@sdcendekia-demo",
    icon: "youtube",
    isActive: true,
    sortOrder: 3,
  },
  {
    platform: "TIKTOK",
    label: "TikTok",
    url: "https://tiktok.com/@sdcendekia.demo",
    icon: "tiktok",
    isActive: false,
    sortOrder: 4,
  },
];

const WEBSITE_SETTINGS = [
  {
    key: "seo.defaultTitle",
    value: "SD Cendekia Nusantara — Sekolah Dasar Aktif dan Berkarakter",
    group: "seo",
    valueType: SettingValueType.STRING,
    description: "Judul default halaman.",
    isPublic: true,
  },
  {
    key: "seo.defaultDescription",
    value:
      "Website resmi SD Cendekia Nusantara: profil, program, fasilitas, guru, prestasi, kegiatan, berita, galeri, dan informasi PPDB.",
    group: "seo",
    valueType: SettingValueType.STRING,
    description: "Deskripsi mesin pencari.",
    isPublic: true,
  },
  {
    key: "seo.keywords",
    value:
      "sekolah dasar, sekolah ramah anak, sekolah berkarakter, literasi, numerasi, PPDB SD, Kota Contoh",
    group: "seo",
    valueType: SettingValueType.STRING,
    description: "Ganti nama daerah dan keunggulan nyata.",
    isPublic: true,
  },
  {
    key: "seo.openGraphImageUrl",
    value: "https://picsum.photos/seed/demo-open-graph/1200/630",
    group: "seo",
    valueType: SettingValueType.URL,
    description: "Gambar saat tautan dibagikan.",
    isPublic: true,
  },
  {
    key: "seo.allowIndexing",
    value: false,
    group: "seo",
    valueType: SettingValueType.BOOLEAN,
    description: "Untuk demo lokal sebaiknya FALSE.",
    isPublic: true,
  },
  {
    key: "home.heroPrimaryCtaLabel",
    value: "Lihat Informasi PPDB",
    group: "beranda",
    valueType: SettingValueType.STRING,
    description: "CTA utama.",
    isPublic: true,
  },
  {
    key: "home.heroSecondaryCtaLabel",
    value: "Kenali Sekolah Kami",
    group: "beranda",
    valueType: SettingValueType.STRING,
    description: "CTA kedua.",
    isPublic: true,
  },
  {
    key: "home.statsStudents",
    value: 420,
    group: "beranda",
    valueType: SettingValueType.NUMBER,
    description: "Angka demo.",
    isPublic: true,
  },
  {
    key: "home.statsTeachers",
    value: 32,
    group: "beranda",
    valueType: SettingValueType.NUMBER,
    description: "Angka demo.",
    isPublic: true,
  },
  {
    key: "home.statsPrograms",
    value: 6,
    group: "beranda",
    valueType: SettingValueType.NUMBER,
    description: "Angka demo.",
    isPublic: true,
  },
  {
    key: "home.statsAchievements",
    value: 48,
    group: "beranda",
    valueType: SettingValueType.NUMBER,
    description: "Angka demo.",
    isPublic: true,
  },
  {
    key: "contact.formEnabled",
    value: true,
    group: "kontak",
    valueType: SettingValueType.BOOLEAN,
    description: "Formulir kontak publik.",
    isPublic: true,
  },
  {
    key: "contact.showFloatingWhatsapp",
    value: true,
    group: "kontak",
    valueType: SettingValueType.BOOLEAN,
    description: "Tombol WhatsApp mengambang.",
    isPublic: true,
  },
  {
    key: "privacy.policyText",
    value:
      "Sekolah menggunakan data formulir kontak hanya untuk menanggapi pertanyaan. Dokumentasi siswa dipublikasikan setelah melalui proses persetujuan dan peninjauan internal.",
    group: "kebijakan",
    valueType: SettingValueType.STRING,
    description: "Ringkasan demo.",
    isPublic: true,
  },
];

const PPDB_TIMELINE = [
  {
    id: "e835bc11-e86c-5421-aa7d-e0187fcd2d3d",
    title: "Publikasi Informasi Awal",
    description: "Website dan media sosial mulai menampilkan informasi PPDB.",
    startDate: dateOnly("2026-12-15"),
    endDate: dateOnly("2027-01-04"),
    sortOrder: 1,
  },
  {
    id: "453f2656-9f49-51b0-bf57-46cf80f8a30a",
    title: "Pendaftaran Eksternal",
    description:
      "Orang tua mengisi formulir pada kanal resmi yang diumumkan sekolah.",
    startDate: dateOnly("2027-01-05"),
    endDate: dateOnly("2027-03-31"),
    sortOrder: 2,
  },
  {
    id: "542b5f5d-410e-54f2-aa17-25c28e4432e5",
    title: "Observasi dan Pertemuan Orang Tua",
    description:
      "Jadwal ditentukan oleh panitia setelah data pendaftaran diterima.",
    startDate: dateOnly("2027-02-01"),
    endDate: dateOnly("2027-04-05"),
    sortOrder: 3,
  },
  {
    id: "79f4d383-be5d-570d-a429-20d3881c5bd1",
    title: "Pengumuman Hasil",
    description:
      "Pengumuman disampaikan melalui kontak resmi dan kanal yang ditentukan sekolah.",
    startDate: dateOnly("2027-04-10"),
    endDate: dateOnly("2027-04-10"),
    sortOrder: 4,
  },
  {
    id: "07786497-bf6f-554d-b333-981bf29b38f2",
    title: "Daftar Ulang",
    description:
      "Orang tua menyelesaikan proses administrasi sesuai petunjuk panitia.",
    startDate: dateOnly("2027-04-11"),
    endDate: dateOnly("2027-04-25"),
    sortOrder: 5,
  },
];

const PPDB_REQUIREMENTS = [
  {
    id: "cfdce49f-5686-5c31-9ee9-f91da8361a25",
    title: "Kartu Keluarga",
    description: "Salinan kartu keluarga yang masih berlaku.",
    isRequired: true,
    sortOrder: 1,
  },
  {
    id: "63b967a9-fb14-5899-b5b4-c45a2eff98b5",
    title: "Akta Kelahiran",
    description: "Salinan akta kelahiran calon siswa.",
    isRequired: true,
    sortOrder: 2,
  },
  {
    id: "fdbb25d9-5422-5938-b382-5b541a626d50",
    title: "Identitas Orang Tua/Wali",
    description: "Salinan KTP orang tua atau wali.",
    isRequired: true,
    sortOrder: 3,
  },
  {
    id: "e01e15a7-50b8-5fed-b839-117b9eefc315",
    title: "Pas Foto Calon Siswa",
    description: "Pas foto terbaru sesuai ketentuan panitia.",
    isRequired: true,
    sortOrder: 4,
  },
  {
    id: "0ec1ef39-4ced-59b4-be00-f900b7261d40",
    title: "Formulir Pendaftaran Eksternal",
    description: "Diisi melalui kanal resmi sekolah, bukan pada website ini.",
    isRequired: true,
    sortOrder: 5,
  },
  {
    id: "c90b7c0d-39f1-5484-a975-ca3413ba8789",
    title: "Dokumen Pendukung",
    description:
      "Dokumen tambahan apabila dibutuhkan sesuai kebijakan sekolah.",
    isRequired: false,
    sortOrder: 6,
  },
];

const PPDB_FLOW_STEPS = [
  {
    id: "a4204c8b-dd60-52a0-a6e0-14e1165a564d",
    title: "Pelajari Informasi",
    description:
      "Baca program, jadwal, persyaratan, biaya, dan FAQ PPDB pada website.",
    sortOrder: 1,
  },
  {
    id: "4bff1324-04f3-5079-b8de-93af507979d0",
    title: "Hubungi Panitia",
    description:
      "Konfirmasi informasi melalui WhatsApp atau kontak resmi sekolah.",
    sortOrder: 2,
  },
  {
    id: "d3368717-ea3f-5fdf-a820-17b3f3591b57",
    title: "Isi Formulir Eksternal",
    description: "Isi formulir pada tautan resmi yang diberikan sekolah.",
    sortOrder: 3,
  },
  {
    id: "e43f82ac-58b5-5510-8693-73253a45cc11",
    title: "Ikuti Jadwal Sekolah",
    description:
      "Hadir pada observasi atau pertemuan orang tua apabila dijadwalkan.",
    sortOrder: 4,
  },
  {
    id: "4146982c-16b0-5516-b83b-3887c32700cf",
    title: "Terima Informasi Hasil",
    description: "Pantau pengumuman melalui kanal resmi sekolah.",
    sortOrder: 5,
  },
  {
    id: "279f33ac-8759-5d3e-87ab-3f51610ade2d",
    title: "Selesaikan Daftar Ulang",
    description: "Ikuti instruksi administrasi dari panitia PPDB.",
    sortOrder: 6,
  },
];

const PPDB_FEES = [
  {
    id: "d4a8cc42-7a95-5d89-8854-0fa633c48544",
    feeType: PpdbFeeType.REGISTRATION,
    name: "Biaya Administrasi",
    amount: 250000,
    description: "Biaya administrasi proses awal. Nilai hanya contoh.",
    isOptional: false,
    sortOrder: 1,
  },
  {
    id: "7c333434-29fd-5dce-9331-9280ee475d5e",
    feeType: PpdbFeeType.DEVELOPMENT,
    name: "Dana Pengembangan",
    amount: 3500000,
    description: "Estimasi dana pengembangan sarana. Nilai hanya contoh.",
    isOptional: false,
    sortOrder: 2,
  },
  {
    id: "5c28de4f-88d8-5421-8464-ec68271ccb8c",
    feeType: PpdbFeeType.UNIFORM,
    name: "Paket Seragam",
    amount: 1250000,
    description: "Estimasi paket seragam sekolah.",
    isOptional: false,
    sortOrder: 3,
  },
  {
    id: "fe50e9d3-13cd-5f70-af73-9dbec1458444",
    feeType: PpdbFeeType.ACTIVITY,
    name: "Kegiatan Tahunan",
    amount: 750000,
    description: "Estimasi kegiatan siswa selama satu tahun.",
    isOptional: false,
    sortOrder: 4,
  },
  {
    id: "52693de3-b6c0-50f5-bbc5-301f014aac90",
    feeType: PpdbFeeType.OTHER,
    name: "Perlengkapan Awal",
    amount: 500000,
    description: "Estimasi buku penghubung dan perlengkapan awal.",
    isOptional: true,
    sortOrder: 5,
  },
];

async function seedSuperAdmin() {
  const name = getRequiredEnv("SEED_ADMIN_NAME");
  const username = getRequiredEnv("SEED_ADMIN_USERNAME").toLowerCase();
  const password = getRequiredEnv("SEED_ADMIN_PASSWORD");
  const emailValue = process.env.SEED_ADMIN_EMAIL?.trim();
  const email = emailValue ? emailValue.toLowerCase() : null;

  const existingUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (existingUser) {
    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        email,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
      select: { id: true, username: true },
    });

    console.log(`✓ Super admin diperbarui: ${user.username}`);
    return user;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      mustChangePassword: true,
    },
    select: { id: true, username: true },
  });

  console.log(`✓ Super admin dibuat: ${user.username}`);
  return user;
}

async function seedSchoolProfile() {
  const { latitude, longitude, ...data } = SCHOOL_PROFILE;

  await prisma.schoolProfile.upsert({
    where: { id: SCHOOL_PROFILE.id },
    create: {
      ...data,
      latitude: new Prisma.Decimal(latitude),
      longitude: new Prisma.Decimal(longitude),
    },
    update: {
      ...data,
      latitude: new Prisma.Decimal(latitude),
      longitude: new Prisma.Decimal(longitude),
    },
  });

  console.log("✓ Profil sekolah: 1");
}

async function seedWebsiteSettings() {
  for (const setting of WEBSITE_SETTINGS) {
    await prisma.websiteSetting.upsert({
      where: { key: setting.key },
      create: {
        ...setting,
        value: setting.value as Prisma.InputJsonValue,
      },
      update: {
        value: setting.value as Prisma.InputJsonValue,
        valueType: setting.valueType,
        group: setting.group,
        description: setting.description,
        isPublic: setting.isPublic,
      },
    });
  }

  console.log(`✓ Pengaturan website: ${WEBSITE_SETTINGS.length}`);
}

async function seedSocialLinks() {
  for (const item of SOCIAL_LINKS) {
    await prisma.socialLink.upsert({
      where: { platform: item.platform },
      create: item,
      update: item,
    });
  }

  console.log(`✓ Media sosial: ${SOCIAL_LINKS.length}`);
}

async function seedPrograms() {
  for (const item of PROGRAMS) {
    await prisma.program.upsert({
      where: { slug: item.slug },
      create: {
        ...item,
        publishedAt: SHOWCASE_PUBLISHED_AT,
      },
      update: {
        ...item,
        publishedAt: SHOWCASE_PUBLISHED_AT,
      },
    });
  }

  console.log(`✓ Program: ${PROGRAMS.length}`);
}

async function seedFacilities() {
  for (const item of FACILITIES) {
    await prisma.facility.upsert({
      where: { slug: item.slug },
      create: item,
      update: item,
    });
  }

  console.log(`✓ Fasilitas: ${FACILITIES.length}`);
}

async function seedTeachers() {
  for (const item of TEACHERS) {
    await prisma.teacher.upsert({
      where: { slug: item.slug },
      create: item,
      update: item,
    });
  }

  console.log(`✓ Guru: ${TEACHERS.length}`);
}

async function seedAchievements() {
  for (const item of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { slug: item.slug },
      create: {
        ...item,
        publishedAt: SHOWCASE_PUBLISHED_AT,
      },
      update: {
        ...item,
        publishedAt: SHOWCASE_PUBLISHED_AT,
      },
    });
  }

  console.log(`✓ Prestasi: ${ACHIEVEMENTS.length}`);
}

async function seedExtracurriculars() {
  for (const item of EXTRACURRICULARS) {
    await prisma.extracurricular.upsert({
      where: { slug: item.slug },
      create: item,
      update: item,
    });
  }

  console.log(`✓ Ekstrakurikuler: ${EXTRACURRICULARS.length}`);
}

async function seedPosts(authorId: string) {
  const categoryIds = new Map<string, string>();

  for (const category of POST_CATEGORIES) {
    const saved = await prisma.postCategory.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
      select: { id: true, slug: true },
    });

    categoryIds.set(saved.slug, saved.id);
  }

  for (const item of POSTS) {
    const categoryId = categoryIds.get(item.categorySlug);

    if (!categoryId) {
      throw new Error(`Kategori berita tidak ditemukan: ${item.categorySlug}`);
    }

    const postData = {
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      featuredImageUrl: item.featuredImageUrl,
      status: item.status,
      publishedAt: item.publishedAt,
    };

    await prisma.post.upsert({
      where: { slug: item.slug },
      create: {
        ...postData,
        authorId,
        categoryId,
        seoTitle: item.title.slice(0, 180),
        seoDescription: item.excerpt.slice(0, 320),
      },
      update: {
        ...postData,
        authorId,
        categoryId,
        seoTitle: item.title.slice(0, 180),
        seoDescription: item.excerpt.slice(0, 320),
      },
    });
  }

  console.log(`✓ Kategori berita: ${POST_CATEGORIES.length}`);
  console.log(`✓ Berita: ${POSTS.length}`);
}

async function seedAnnouncements(createdById: string) {
  for (const item of ANNOUNCEMENTS) {
    await prisma.announcement.upsert({
      where: { slug: item.slug },
      create: {
        ...item,
        createdById,
      },
      update: {
        ...item,
        createdById,
      },
    });
  }

  console.log(`✓ Pengumuman: ${ANNOUNCEMENTS.length}`);
}

async function seedFaqs() {
  for (const item of FAQS) {
    await prisma.faq.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  console.log(`✓ FAQ: ${FAQS.length}`);
}

async function seedTestimonials() {
  for (const item of TESTIMONIALS) {
    await prisma.testimonial.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    });
  }

  console.log(`✓ Testimoni: ${TESTIMONIALS.length}`);
}

async function seedGallery() {
  const albumIds = new Map<string, string>();

  for (const album of GALLERY_ALBUMS) {
    const saved = await prisma.galleryAlbum.upsert({
      where: { slug: album.slug },
      create: {
        ...album,
        publishedAt: SHOWCASE_PUBLISHED_AT,
      },
      update: {
        ...album,
        publishedAt: SHOWCASE_PUBLISHED_AT,
      },
      select: { id: true, slug: true },
    });

    albumIds.set(saved.slug, saved.id);
  }

  for (const media of GALLERY_MEDIA) {
    const albumId = albumIds.get(media.albumSlug);

    if (!albumId) {
      throw new Error(`Album galeri tidak ditemukan: ${media.albumSlug}`);
    }

    const mediaData = {
      id: media.id,
      mediaType: media.mediaType,
      fileUrl: media.fileUrl,
      thumbnailUrl: media.thumbnailUrl,
      caption: media.caption,
      altText: media.altText,
      sortOrder: media.sortOrder,
    };

    await prisma.galleryMedia.upsert({
      where: { id: media.id },
      create: {
        ...mediaData,
        albumId,
      },
      update: {
        ...mediaData,
        albumId,
      },
    });
  }

  console.log(`✓ Album galeri: ${GALLERY_ALBUMS.length}`);
  console.log(`✓ Media galeri: ${GALLERY_MEDIA.length}`);
}

async function seedDocuments() {
  for (const item of DOWNLOAD_DOCUMENTS) {
    await prisma.downloadDocument.upsert({
      where: { slug: item.slug },
      create: item,
      update: item,
    });
  }

  console.log(`✓ Dokumen: ${DOWNLOAD_DOCUMENTS.length}`);
}

async function seedPpdb() {
  const academicYear = "2027/2028";

  await prisma.ppdbInformation.updateMany({
    where: {
      academicYear: {
        not: academicYear,
      },
    },
    data: {
      isActive: false,
    },
  });

  const ppdb = await prisma.ppdbInformation.upsert({
    where: { academicYear },
    create: {
      academicYear,
      title: "Informasi PPDB SD Cendekia Nusantara Tahun Ajaran 2027/2028",
      status: PpdbStatus.COMING_SOON,
      shortDescription:
        "Kenali program, fasilitas, jadwal, persyaratan, alur, dan kontak resmi PPDB.",
      description:
        "SD Cendekia Nusantara membuka kesempatan bagi orang tua untuk mengenal lingkungan belajar yang aktif, aman, dan ramah anak. Website ini hanya menyajikan informasi. Pendaftaran dilakukan melalui kanal eksternal resmi yang akan diumumkan sekolah.",
      quota: 72,
      brochureUrl: "/demo/documents/brosur-ppdb-2027-2028.pdf",
      externalRegistrationUrl: "https://forms.example.com/ppdb-demo",
      registrationLocation:
        "SD Cendekia Nusantara, Jl. Pendidikan No. 10, Kota Contoh",
      contactPerson: "Panitia PPDB",
      contactPhone: "6281100000000",
      contactEmail: "ppdb@demo-sekolah.id",
      serviceHours: "Senin–Jumat, 08.00–15.00 WIB",
      scholarshipInformation:
        "Informasi bantuan pendidikan dapat dikonsultasikan langsung dengan panitia PPDB.",
      showFee: true,
      showExternalRegistrationButton: true,
      isActive: true,
    },
    update: {
      title: "Informasi PPDB SD Cendekia Nusantara Tahun Ajaran 2027/2028",
      status: PpdbStatus.COMING_SOON,
      shortDescription:
        "Kenali program, fasilitas, jadwal, persyaratan, alur, dan kontak resmi PPDB.",
      description:
        "SD Cendekia Nusantara membuka kesempatan bagi orang tua untuk mengenal lingkungan belajar yang aktif, aman, dan ramah anak. Website ini hanya menyajikan informasi. Pendaftaran dilakukan melalui kanal eksternal resmi yang akan diumumkan sekolah.",
      quota: 72,
      brochureUrl: "/demo/documents/brosur-ppdb-2027-2028.pdf",
      externalRegistrationUrl: "https://forms.example.com/ppdb-demo",
      registrationLocation:
        "SD Cendekia Nusantara, Jl. Pendidikan No. 10, Kota Contoh",
      contactPerson: "Panitia PPDB",
      contactPhone: "6281100000000",
      contactEmail: "ppdb@demo-sekolah.id",
      serviceHours: "Senin–Jumat, 08.00–15.00 WIB",
      scholarshipInformation:
        "Informasi bantuan pendidikan dapat dikonsultasikan langsung dengan panitia PPDB.",
      showFee: true,
      showExternalRegistrationButton: true,
      isActive: true,
    },
    select: { id: true },
  });

  for (const item of PPDB_TIMELINE) {
    await prisma.ppdbTimelineItem.upsert({
      where: { id: item.id },
      create: {
        ...item,
        ppdbId: ppdb.id,
      },
      update: {
        ...item,
        ppdbId: ppdb.id,
      },
    });
  }

  for (const item of PPDB_REQUIREMENTS) {
    await prisma.ppdbRequirement.upsert({
      where: { id: item.id },
      create: {
        ...item,
        ppdbId: ppdb.id,
      },
      update: {
        ...item,
        ppdbId: ppdb.id,
      },
    });
  }

  for (const item of PPDB_FLOW_STEPS) {
    await prisma.ppdbFlowStep.upsert({
      where: { id: item.id },
      create: {
        ...item,
        ppdbId: ppdb.id,
      },
      update: {
        ...item,
        ppdbId: ppdb.id,
      },
    });
  }

  for (const item of PPDB_FEES) {
    const { amount, ...feeData } = item;

    await prisma.ppdbFee.upsert({
      where: { id: item.id },
      create: {
        ...feeData,
        amount: new Prisma.Decimal(amount),
        ppdbId: ppdb.id,
      },
      update: {
        ...feeData,
        amount: new Prisma.Decimal(amount),
        ppdbId: ppdb.id,
      },
    });
  }

  console.log("✓ Informasi PPDB: 1");
  console.log(`✓ Jadwal PPDB: ${PPDB_TIMELINE.length}`);
  console.log(`✓ Syarat PPDB: ${PPDB_REQUIREMENTS.length}`);
  console.log(`✓ Alur PPDB: ${PPDB_FLOW_STEPS.length}`);
  console.log(`✓ Biaya PPDB: ${PPDB_FEES.length}`);
}

async function seedAuditMarker(actorId: string) {
  const entityId = "showcase-sd-cendekia-v1";

  const existing = await prisma.auditLog.findFirst({
    where: {
      action: "SHOWCASE_SEED_APPLIED",
      entity: "DatabaseSeed",
      entityId,
    },
    select: { id: true },
  });

  if (existing) {
    return;
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "SHOWCASE_SEED_APPLIED",
      entity: "DatabaseSeed",
      entityId,
      newValue: {
        schoolName: SCHOOL_PROFILE.schoolName,
        source: "Data_Showcase_Website_Sekolah_Dasar_dengan_URL_Gambar.xlsx",
        appliedAt: new Date().toISOString(),
      },
    },
  });
}

async function main(): Promise<void> {
  console.log("Memulai seed showcase website sekolah...");
  console.log(
    "Mode: idempotent; data pengguna, sesi, pesan kontak, dan audit lama tidak dihapus.",
  );

  const admin = await seedSuperAdmin();

  await seedSchoolProfile();
  await seedWebsiteSettings();
  await seedSocialLinks();
  await seedPrograms();
  await seedFacilities();
  await seedTeachers();
  await seedAchievements();
  await seedExtracurriculars();
  await seedPosts(admin.id);
  await seedAnnouncements(admin.id);
  await seedFaqs();
  await seedTestimonials();
  await seedGallery();
  await seedDocuments();
  await seedPpdb();
  await seedAuditMarker(admin.id);

  console.log("Seed showcase selesai.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed showcase gagal.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
