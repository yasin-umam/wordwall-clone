-- =============================================================================
-- SEED DATA — dijalankan otomatis oleh `supabase db reset` (lokal).
-- Membuat 1 guru demo + beberapa aktivitas contoh di semua template.
--
-- Login demo:  email = demo@playlearn.app   password = demo123456
--
-- CATATAN: insert langsung ke auth.users hanya untuk DEV LOKAL.
-- Untuk project hosted, daftar lewat UI lalu jalankan bagian INSERT activities
-- dengan owner_id = auth.uid() kamu sendiri.
-- =============================================================================

-- Guru demo -------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
values (
  '00000000-0000-0000-0000-000000000000',
  'd0d0d0d0-0000-4000-a000-000000000001',
  'authenticated', 'authenticated',
  'demo@playlearn.app',
  crypt('demo123456', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Bu Guru Demo"}'
)
on conflict (id) do nothing;

-- Identity untuk login email/password
insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
values (
  'd0d0d0d0-0000-4000-a000-000000000001',
  'd0d0d0d0-0000-4000-a000-000000000001',
  '{"sub":"d0d0d0d0-0000-4000-a000-000000000001","email":"demo@playlearn.app"}',
  'email', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

-- Aktivitas contoh ------------------------------------------------------------
insert into public.activities (id, owner_id, title, template_type, content, theme, settings, is_public, share_slug)
values
  (
    'a0000000-0000-4000-a000-000000000001',
    'd0d0d0d0-0000-4000-a000-000000000001',
    'Kuis Pengetahuan Umum Indonesia',
    'quiz',
    '{"items":[
      {"q":"Apa ibu kota Indonesia?","options":["Jakarta","Bandung","Surabaya","Medan"],"answer":0},
      {"q":"Berapa jumlah provinsi di Indonesia (2024)?","options":["34","36","38","40"],"answer":2},
      {"q":"Pulau terbesar di Indonesia adalah?","options":["Jawa","Sumatra","Kalimantan","Papua"],"answer":2},
      {"q":"Lagu kebangsaan Indonesia adalah?","options":["Indonesia Raya","Garuda Pancasila","Hari Merdeka","Bagimu Negeri"],"answer":0}
    ]}',
    'jungle',
    '{"timer":true,"shuffle":true,"showAnswer":true}',
    true,
    'kuis-indonesia'
  ),
  (
    'a0000000-0000-4000-a000-000000000002',
    'd0d0d0d0-0000-4000-a000-000000000001',
    'Kosakata Hewan: Indonesia - Inggris',
    'match_up',
    '{"pairs":[
      {"left":"Anjing","right":"Dog"},
      {"left":"Kucing","right":"Cat"},
      {"left":"Burung","right":"Bird"},
      {"left":"Ikan","right":"Fish"},
      {"left":"Kuda","right":"Horse"}
    ]}',
    'candy',
    '{"timer":true,"shuffle":true}',
    true,
    'match-hewan'
  ),
  (
    'a0000000-0000-4000-a000-000000000003',
    'd0d0d0d0-0000-4000-a000-000000000001',
    'Susun Kata: Benda di Kelas',
    'anagram',
    '{"words":[
      {"word":"PAPAN","hint":"Tempat menulis di depan kelas"},
      {"word":"BUKU","hint":"Dibaca dan ditulisi"},
      {"word":"PENSIL","hint":"Alat tulis bisa dihapus"},
      {"word":"MEJA","hint":"Tempat meletakkan buku"}
    ]}',
    'classic',
    '{"timer":true}',
    true,
    'anagram-kelas'
  ),
  (
    'a0000000-0000-4000-a000-000000000004',
    'd0d0d0d0-0000-4000-a000-000000000001',
    'Kartu Flash: Kosakata Buah',
    'flashcards',
    '{"pairs":[
      {"left":"Apel","right":"Apple"},
      {"left":"Pisang","right":"Banana"},
      {"left":"Jeruk","right":"Orange"},
      {"left":"Mangga","right":"Mango"}
    ]}',
    'ocean',
    '{}',
    false,
    'flashcards-buah'
  );

-- Hasil main contoh (untuk mengisi leaderboard demo) --------------------------
insert into public.play_results (activity_id, player_name, score, time_ms, accuracy)
values
  ('a0000000-0000-4000-a000-000000000001','Andi',  300, 28000, 1.00),
  ('a0000000-0000-4000-a000-000000000001','Sinta', 225, 31000, 0.75),
  ('a0000000-0000-4000-a000-000000000001','Budi',  150, 26000, 0.50);
