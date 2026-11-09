-- One-off target review after the week of 2 to 8 Nov 2026. Run once in the Supabase SQL editor.
--
-- Lateral raise: 12 reps felt Good on 22 Oct, then only 10 of the target on 4 Nov (Hard) at 12.5 lb.
--   The target had climbed to 14, which you are not close to yet. Reset to 12.5 lb x 12 (bottom of
--   the 12-15 range) so the next session is a target you can beat, then the app adds reps from there.
-- Chest-supported row: 25 lb x 10 felt Easy on its first try, and your one-arm row is 35 lb for 8.
--   Move it to 30 lb x 10 instead of spending another session at 25.
-- Everything else stays as the app set it: hammer curl already dropped to 25 x 10 after the Hard 30 lb,
--   incline press already moved to 35 x 8, and the rest are progressing on Good.

update public.exercise_targets
set weight_lb = 12.5, reps = 12, updated_at = now()
where exercise_key = 'db_lateral';

update public.exercise_targets
set weight_lb = 30, reps = 10, updated_at = now()
where exercise_key = 'cs_row';

-- Check: expect db_lateral 12.5 x 12 and cs_row 30 x 10
select exercise_key, weight_lb, reps from public.exercise_targets
where exercise_key in ('db_lateral', 'cs_row') order by exercise_key;
