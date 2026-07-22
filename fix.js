const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/init.sql', 'utf8');
const lines = content.split('\n');
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('c r e a t e   p o l i c y') || lines[i].includes('c\u0000r\u0000e\u0000a\u0000t\u0000e')) {
    break;
  }
  newLines.push(lines[i]);
}
newLines.push('-- ---------- WISHLISTS ----------');
newLines.push('create policy "Users can view their own wishlists" on public.wishlists for select using ( auth.uid() = buyer_id );');
newLines.push('create policy "Users can insert their own wishlists" on public.wishlists for insert with check ( auth.uid() = buyer_id );');
newLines.push('create policy "Users can delete their own wishlists" on public.wishlists for delete using ( auth.uid() = buyer_id );');
newLines.push('');
fs.writeFileSync('supabase/migrations/init.sql', newLines.join('\n'));
console.log('Fixed init.sql!');
