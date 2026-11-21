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
    topics: "Tema",
    about: "Tentang",
    language: "Bahasa",
    switchToLight: "Ganti ke mode terang",
    switchToDark: "Ganti ke mode gelap",
  },
  footer: {
    about: "Tentang dan sumber",
    privacy: "Privasi",
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
    indonesianFrom: "Terjemahan Indonesia dari {source}",
    indonesianPartly: "Sebagian hadis berterjemahan Indonesia, dari {source}",
  },
  book: {
    chapters: "Bab",
    unnamedChapter: "Hadis yang tidak masuk bab di sumbernya",
    chapterLabel: "Bab {number}",
    chapterNamesNote: "Nama Inggris dari sumbernya ada di bawah setiap nama bab.",
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
    sanad: "Sanad",
    attribution: "Takhrij",
    translationFrom: "Terjemahan dari {source}, ditampilkan tanpa perubahan",
    translationScope: "Yang diterjemahkan adalah hadis dan takhrijnya; catatan sesudahnya di teks Arab di atas (misalnya tentang jalur riwayatnya) bisa jadi tidak ikut diterjemahkan.",
    copyLink: "Salin tautan",
    copied: "Tautan disalin",
    open: "Buka hadis {number}",
    inBook: "{book}, hadis {number}",
  },
  topics: {
    title: "Hadis per tema",
    intro: "Hadis-hadis pilihan yang disusun per tema, masing-masing dengan derajat, sumber, penjelasan, dan faedahnya.",
    homeLink: "Baca per tema",
    homeText: "Hadis pilihan dengan penjelasan, dari HadeethEnc.com",
    subtopics: "Tema",
    hadiths: "Hadis",
    all: "Semua tema",
    showSubtopics: "Lihat temanya",
    grade: "Derajat",
    attribution: "Takhrij",
    explanation: "Penjelasan",
    lessons: "Faedah",
    inTopics: "Termasuk dalam tema",
    otherLanguage: {
      en: "Dalam bahasa Inggris (hadis ini tidak punya terjemahan Indonesia di HadeethEnc)",
      id: "Dalam bahasa Indonesia (hadis ini tidak punya terjemahan Inggris di HadeethEnc)",
    },
    credit: "Dari HadeethEnc.com, terbitan Rowwad Translation Center, ditampilkan tanpa perubahan.",
    original: "Lihat di HadeethEnc.com",
  },
  display: {
    textSize: "Ukuran huruf",
    arabicSize: "Teks Arab",
    latinSize: "Terjemahan",
    smaller: "Perkecil: {name}",
    larger: "Perbesar: {name}",
  },
  pagination: {
    label: "Halaman",
    range: "{from} sampai {to} dari {total} hadis",
    previous: "Halaman sebelumnya",
    next: "Halaman berikutnya",
    page: "Halaman {number}",
    perPage: "Hadis per halaman",
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
  privacy: {
    title: "Kebijakan privasi",
    intro: "HadistWeb adalah situs baca hadis yang gratis. Tidak ada akun dan tidak perlu mendaftar. Halaman ini menjelaskan apa yang disimpan situs ini dan siapa saja yang ikut melihat datanya.",
    sections: {
      reading: {
        title: "Yang tersimpan di browser Anda",
        body: "Pilihan tema terang atau gelap disimpan di penyimpanan lokal (local storage) browser Anda dan tidak keluar dari sana. Dua cookie kecil menyimpan bahasa antarmuka (hw-lang) dan jumlah hadis per halaman bab (hw-page-size), supaya halaman tampil sesuai pilihan Anda. Situs ini tidak menyimpan hal lain tentang Anda: tidak ada riwayat bacaan, penanda, atau akun.",
      },
      sources: {
        title: "Asal teks",
        body: "Kitab-kitab hadis berasal dari salinan fawazahmed0/hadith-api milik kami di server ini. Bagian tema dan sebagian terjemahan Indonesia berasal dari HadeethEnc.com: yang meminta datanya ke HadeethEnc adalah server kami, bukan browser Anda, jadi HadeethEnc tidak melihat alamat IP Anda atau data lain tentang Anda.",
      },
      analytics: {
        title: "Statistik pengunjung",
        body: "Untuk mengetahui seberapa banyak situs ini dipakai, kami memakai Cloudflare Web Analytics. Saat halaman dibuka, skrip kecil dari Cloudflare melaporkan halaman yang dilihat, halaman asal Anda, jenis browser, sistem operasi dan perangkat, negara, serta kecepatan halaman dimuat. Menurut Cloudflare, alat ini tidak memasang cookie, tidak menyimpan apa pun di browser Anda, dan tidak memakai alamat IP atau ciri browser Anda untuk mengenali atau mengikuti Anda. Kami hanya melihat angka total (misalnya kunjungan per halaman atau per negara), tidak pernah per pengunjung, dan hanya untuk memahami lalu lintas situs ini, tidak untuk iklan. Kalau browser atau ekstensi Anda memblokir skrip itu, situs tetap berjalan seperti biasa.",
      },
      recipients: {
        title: "Siapa yang menangani data",
        body: "Cloudflare (DNS dan proxy situs, serta statistik pengunjung) dan penyedia hosting server. Server web kami dan Cloudflare memproses alamat IP untuk mengirimkan halaman, seperti semua situs web. Kami tidak menjual data dan tidak membagikannya untuk keperluan lain.",
      },
      law: {
        title: "Hukum yang berlaku",
        body: "Kebijakan ini mengikuti hukum pelindungan data pribadi Indonesia (Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi, UU PDP).",
      },
    },
    contactTitle: "Kontak",
    contactBy: "Situs ini dikelola oleh {name}.",
    contactEmail: "Pertanyaan tentang kebijakan ini: {email}",
    contactMissing: "Kontak untuk pertanyaan tentang kebijakan ini belum disiapkan.",
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
    hadeethenc:
      "Bagian tema berasal dari HadeethEnc.com (Ensiklopedia Hadis Nabi Terjemahan), terbitan Rowwad Translation Center. Isinya boleh dipakai ulang tanpa diubah, dengan menyebut HadeethEnc.com sebagai penerbit dan sumber; teksnya dibaca dari situs itu dan ditampilkan persis seperti terbitannya. Terjemahan Indonesia Arbain an-Nawawi dan 20 dari Empat Puluh Hadis Qudsi juga berasal dari sana, karena fawazahmed0/hadith-api tidak memilikinya.",
    chapterNames:
      "Sumbernya memberi nama bab dalam bahasa Inggris. Nama bab bahasa Indonesia disusun untuk situs ini, dengan nama Arab setiap kitab dalam kurung, lalu ditinjau; nama Inggris dari sumbernya tetap ditampilkan.",
    code: "Kode situs ini terbuka dengan lisensi MIT.",
    codeLink: "Lihat kodenya di GitHub",
  },
};
