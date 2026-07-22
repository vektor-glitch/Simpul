const fs = require('fs');
const notificationsSQL = `
-- ============================================================
-- TABEL NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS NOTIFICATIONS
alter table public.notifications enable row level security;
create policy "Users can view their own notifications" on public.notifications for select using ( auth.uid() = user_id );
create policy "Users can update their own notifications" on public.notifications for update using ( auth.uid() = user_id );

-- ============================================================
-- TRIGGER: NOTIFIKASI STATUS PESANAN
-- ============================================================
create or replace function public.handle_order_status_change()
returns trigger as $$
begin
  if old.status <> new.status then
    insert into public.notifications (user_id, title, message, type, link)
    values (
      new.buyer_id, 
      'Status Pesanan Diperbarui', 
      'Pesanan anda sekarang berstatus: ' || new.status, 
      'order_status', 
      '/cart'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_order_status_change
  after update on public.orders
  for each row execute procedure public.handle_order_status_change();
`;
fs.appendFileSync('supabase/migrations/init.sql', '\n' + notificationsSQL);
console.log('Notifications schema added to init.sql');
