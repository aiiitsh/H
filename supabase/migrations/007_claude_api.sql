-- Claude Code's own access to your data, without signing in.
-- A private key (kept only on your laptop; just its SHA-256 hash is stored here) unlocks two functions:
--   claude_export(key, days)          → everything Claude needs for a report (habits/streak are left out)
--   claude_patch_settings(key, patch) → change settings keys (life plan, tasks, categories…), merged in
-- Revoke access any time: delete from public.claude_keys;

create table if not exists public.claude_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  key_hash text not null unique,
  created_at timestamptz not null default now()
);
alter table public.claude_keys enable row level security;
drop policy if exists "own rows" on public.claude_keys;
create policy "own rows" on public.claude_keys for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.claude_user(p_key text) returns uuid
language sql stable security definer set search_path = public as $$
  select user_id from public.claude_keys where key_hash = encode(sha256(convert_to(p_key, 'UTF8')), 'hex')
$$;
revoke all on function public.claude_user(text) from public, anon, authenticated;

create or replace function public.claude_export(p_key text, p_days int default 35) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := public.claude_user(p_key);
  since date;
  quran jsonb := '[]';
begin
  if uid is null then raise exception 'invalid key' using errcode = '28000'; end if;
  since := (now() at time zone 'America/Toronto')::date - greatest(p_days, 1);
  if to_regclass('public.quran_events') is not null then
    execute 'select coalesce(jsonb_agg(q order by q.at), ''[]''::jsonb) from public.quran_events q where q.user_id = $1'
      into quran using uid;
  end if;
  return jsonb_build_object(
    'since', since,
    'app_state', (select to_jsonb(a) from public.app_state a where a.user_id = uid),
    'targets', (select coalesce(jsonb_agg(t order by t.exercise_key), '[]') from public.exercise_targets t where t.user_id = uid),
    'workouts', (select coalesce(jsonb_agg(w order by w.started_at), '[]') from public.workouts w where w.user_id = uid and w.local_date >= since),
    'sets', (select coalesce(jsonb_agg(s order by w.started_at, s.position), '[]')
             from public.workout_sets s join public.workouts w on w.id = s.workout_id
             where s.user_id = uid and w.local_date >= since),
    'logs', (select coalesce(jsonb_agg(l order by l.logged_at), '[]') from public.logs l
             where l.user_id = uid and l.type <> 'photo' and l.local_date >= since),
    'focus', (select coalesce(jsonb_agg(f order by f.started_at), '[]') from public.focus_blocks f where f.user_id = uid and f.local_date >= since),
    'quran', quran,
    'reviews', (select coalesce(jsonb_agg(r order by r.week_start), '[]') from public.weekly_reviews r where r.user_id = uid)
  );
end $$;

create or replace function public.claude_patch_settings(p_key text, p_patch jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := public.claude_user(p_key);
  result jsonb;
begin
  if uid is null then raise exception 'invalid key' using errcode = '28000'; end if;
  if jsonb_typeof(p_patch) <> 'object' then raise exception 'patch must be a JSON object'; end if;
  update public.app_state set settings = coalesce(settings, '{}'::jsonb) || p_patch, updated_at = now()
    where user_id = uid returning settings into result;
  return result;
end $$;

revoke all on function public.claude_export(text, int) from public;
revoke all on function public.claude_patch_settings(text, jsonb) from public;
grant execute on function public.claude_export(text, int) to anon, authenticated;
grant execute on function public.claude_patch_settings(text, jsonb) to anon, authenticated;
