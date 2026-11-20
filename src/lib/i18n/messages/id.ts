import type { Plural } from "../translate";
import type { Messages } from "./types";

const plural = (other: string, one?: string): Plural => ({ one, other });

export const id: Messages = {
  meta: {
    title: "HadistWeb",
    description: "Baca kitab-kitab hadis: teks Arab dengan terjemahan bahasa Indonesia dan Inggris.",
  },
  nav: {
    books: "Kitab",
    about: "Tentang",
    language: "Bahasa",
    switchToLight: "Ganti ke mode terang",
    switchToDark: "Ganti ke mode gelap",
  },
  footer: {
    about: "Tentang dan sumber",
  },
  common: {
    hadiths: plural("{count} hadis"),
    chapters: plural("{count} bab"),
  },
  home: {
    title: "Kitab-kitab hadis",
    subtitle: "Teks Arab dengan terjemahan, per kitab dan per bab.",
    start: "Mulai dari Shahih al-Bukhari",
    listTitle: "Kitab",
    englishOnly: "Terjemahan bahasa Inggris",
  },
  book: {
    chapters: "Bab",
    unnamedChapter: "Hadis yang tidak masuk bab di sumbernya",
    chapterLabel: "Bab {number}",
    chapterNamesNote: "Nama bab masih dalam bahasa Inggris, sesuai sumbernya.",
  },
  chapter: {
    previous: "Bab sebelumnya",
    next: "Bab berikutnya",
    backToBook: "Semua bab",
  },
  hadith: {
    number: "Hadis {number}",
    arabicNumber: "Penomoran Arab: {number}",
    fallback: {
      en: "Terjemahan bahasa Inggris (hadis ini tidak punya terjemahan Indonesia)",
      id: "Terjemahan bahasa Indonesia (hadis ini tidak punya terjemahan Inggris)",
    },
    noTranslation: "Sumbernya tidak punya terjemahan untuk hadis ini.",
    noArabic: "Sumbernya tidak punya teks Arab untuk nomor ini.",
    grades: "Derajat",
    copyLink: "Salin tautan",
    copied: "Tautan disalin",
    open: "Buka hadis {number}",
    inBook: "{book}, hadis {number}",
  },
  pagination: {
    label: "Halaman bab",
    range: "{from} sampai {to} dari {total} hadis",
    previous: "Halaman sebelumnya",
    next: "Halaman berikutnya",
    page: "Halaman {number}",
  },
  notFound: {
    title: "Halaman tidak ditemukan",
    description: "Halaman yang Anda cari tidak ada atau sudah dipindah.",
    home: "Kembali ke daftar kitab",
  },
  error: {
    title: "Data hadis tidak bisa dimuat",
    description: "Sumber data tidak menjawab. Coba lagi sebentar lagi.",
    retry: "Coba lagi",
  },
  about: {
    title: "Tentang",
    intro:
      "HadistWeb menampilkan kitab-kitab hadis dengan teks Arab dan terjemahan bahasa Indonesia atau Inggris. Teksnya ditampilkan sesuai terbitan sumbernya; tidak ada yang disunting di sini.",
    sourcesTitle: "Sumber",
    fawaz:
      "Kitab, bab, terjemahan, dan derajat hadis berasal dari fawazahmed0/hadith-api, yang diterbitkan dengan lisensi Unlicense. Kami menyajikannya dari salinan kami sendiri.",
    fallback:
      "Kalau sebuah hadis tidak punya terjemahan dalam bahasa Anda, terjemahan bahasa lainnya yang ditampilkan, dengan label. Terjemahan Indonesia kosong untuk banyak hadis, karena sumbernya menggabungkan beberapa riwayat dalam satu entri; teks Arab tidak pernah dipasangkan dengan terjemahan hadis lain untuk menutup kekosongan itu.",
    chapterNames: "Nama bab masih dalam bahasa Inggris, sesuai sumbernya. Nama bab bahasa Indonesia menyusul.",
    code: "Kode situs ini terbuka dengan lisensi MIT.",
    codeLink: "Lihat kodenya di GitHub",
  },
};
