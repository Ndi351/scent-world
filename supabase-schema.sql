create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  category text not null,
  product_type text not null check (product_type in ('perfumes', 'hubbly')),
  image text not null,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view visible products"
  on public.products for select
  using (visible = true);

create policy "Authenticated admins can manage products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

insert into public.products (id, name, description, price, category, product_type, image)
values
  ('amber-noir', 'Amber Noir', 'Warm amber, smoked vanilla and sandalwood.', 899, 'Perfume', 'perfumes', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=85'),
  ('velvet-oud', 'Velvet Oud', 'A rich, modern oud with a soft rose finish.', 1099, 'Perfume', 'perfumes', 'https://images.unsplash.com/photo-1610461888750-10bfc601b8a9?auto=format&fit=crop&w=700&q=85'),
  ('citrus-veil', 'Citrus Veil', 'Bright bergamot wrapped in clean white musk.', 749, 'Perfume', 'perfumes', 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=700&q=85'),
  ('midnight-muse', 'Midnight Muse', 'Spiced plum, jasmine and a hint of leather.', 949, 'Perfume', 'perfumes', 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=700&q=85'),
  ('onyx-hookah', 'Onyx Hookah', 'A sleek matte-black pipe with twin hoses and a weighted glass base.', 1899, 'Hookah pipe', 'hubbly', 'assets/hub-pip089-black.png'),
  ('classic-tall', 'Classic Tall Shisha', 'A polished black stem, wide glass base and single hose.', 1599, 'Shisha pipe', 'hubbly', 'assets/hookah-3.webp'),
  ('double-hose', 'Double Hose Hookah', 'A generous glass-base hookah with two sharing hoses.', 1799, 'Hookah pipe', 'hubbly', 'assets/amapipe004-1.jpg'),
  ('blue-mosaic', 'Blue Mosaic Hookah', 'A striking blue-and-glass hookah with matching hose and tongs.', 2399, 'Hookah pipe', 'hubbly', 'assets/hookah-blue.webp')
on conflict (id) do nothing;

-- After running this file, create an admin user in Authentication > Users.
-- Then use that email and password at admin.html.