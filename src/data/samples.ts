import type { Activity } from '@/types';

/**
 * Aktivitas contoh — dipakai sebagai SEED tampilan dalam MODE DEMO LOKAL
 * (saat Supabase belum dikonfigurasi) sekaligus prefill awal di editor.
 * Cermin dari supabase/seed.sql.
 */
const now = new Date().toISOString();

export const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: 'a0000000-0000-4000-a000-000000000001',
    owner_id: 'demo',
    title: 'Kuis Pengetahuan Umum Indonesia',
    template_type: 'quiz',
    content: {
      items: [
        { q: 'Apa ibu kota Indonesia?', options: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'], answer: 0 },
        { q: 'Berapa jumlah provinsi di Indonesia (2024)?', options: ['34', '36', '38', '40'], answer: 2 },
        { q: 'Pulau terbesar di Indonesia adalah?', options: ['Jawa', 'Sumatra', 'Kalimantan', 'Papua'], answer: 2 },
        { q: 'Lagu kebangsaan Indonesia adalah?', options: ['Indonesia Raya', 'Garuda Pancasila', 'Hari Merdeka', 'Bagimu Negeri'], answer: 0 },
      ],
    },
    theme: 'jungle',
    settings: { timer: true, shuffle: true, showAnswer: true },
    is_public: true,
    share_slug: 'kuis-indonesia',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'a0000000-0000-4000-a000-000000000002',
    owner_id: 'demo',
    title: 'Kosakata Hewan: Indonesia - Inggris',
    template_type: 'match_up',
    content: {
      pairs: [
        { left: 'Anjing', right: 'Dog' },
        { left: 'Kucing', right: 'Cat' },
        { left: 'Burung', right: 'Bird' },
        { left: 'Ikan', right: 'Fish' },
        { left: 'Kuda', right: 'Horse' },
      ],
    },
    theme: 'candy',
    settings: { timer: true, shuffle: true },
    is_public: true,
    share_slug: 'match-hewan',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'a0000000-0000-4000-a000-000000000003',
    owner_id: 'demo',
    title: 'Susun Kata: Benda di Kelas',
    template_type: 'anagram',
    content: {
      words: [
        { word: 'PAPAN', hint: 'Tempat menulis di depan kelas' },
        { word: 'BUKU', hint: 'Dibaca dan ditulisi' },
        { word: 'PENSIL', hint: 'Alat tulis bisa dihapus' },
        { word: 'MEJA', hint: 'Tempat meletakkan buku' },
      ],
    },
    theme: 'classic',
    settings: { timer: true },
    is_public: true,
    share_slug: 'anagram-kelas',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'a0000000-0000-4000-a000-000000000004',
    owner_id: 'demo',
    title: 'Kartu Flash: Kosakata Buah',
    template_type: 'flashcards',
    content: {
      pairs: [
        { left: 'Apel', right: 'Apple' },
        { left: 'Pisang', right: 'Banana' },
        { left: 'Jeruk', right: 'Orange' },
        { left: 'Mangga', right: 'Mango' },
      ],
    },
    theme: 'ocean',
    settings: {},
    is_public: false,
    share_slug: 'flashcards-buah',
    created_at: now,
    updated_at: now,
  },
];

export function findSampleBySlug(slug: string): Activity | undefined {
  return SAMPLE_ACTIVITIES.find((a) => a.share_slug === slug);
}
