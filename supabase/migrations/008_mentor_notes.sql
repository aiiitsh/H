-- Private mentor rules for Claude, stored in your account (not in the repo) so any device can load them.
--   claude_get_mentor(key)           → the rules text
--   claude_set_mentor(key, content)  → save/replace the rules text
-- Same access key as 007_claude_api.sql. Revoke any time: delete from public.claude_keys;

create table if not exists public.mentor_notes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content text not null,
  updated_at timestamptz not null default now()
);
alter table public.mentor_notes enable row level security;
drop policy if exists "own rows" on public.mentor_notes;
create policy "own rows" on public.mentor_notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.claude_get_mentor(p_key text) returns text
language plpgsql stable security definer set search_path = public as $$
declare uid uuid := public.claude_user(p_key);
begin
  if uid is null then raise exception 'invalid key' using errcode = '28000'; end if;
  return (select content from public.mentor_notes where user_id = uid);
end $$;

create or replace function public.claude_set_mentor(p_key text, p_content text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := public.claude_user(p_key);
begin
  if uid is null then raise exception 'invalid key' using errcode = '28000'; end if;
  insert into public.mentor_notes (user_id, content) values (uid, p_content)
    on conflict (user_id) do update set content = excluded.content, updated_at = now();
  return jsonb_build_object('saved_chars', length(p_content));
end $$;

revoke all on function public.claude_get_mentor(text) from public;
revoke all on function public.claude_set_mentor(text, text) from public;
grant execute on function public.claude_get_mentor(text) to anon, authenticated;
grant execute on function public.claude_set_mentor(text, text) to anon, authenticated;
