-- Backfill profiles for existing auth.users rows that don't have one
-- Uses the same fallback logic as the handle_new_user trigger

insert into public.profiles (id, username, display_name)
select
    u.id,
    coalesce(u.raw_user_meta_data->>'username', 'user_' || substr(u.id::text, 1, 8)),
    coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
from auth.users u
where not exists (
    select 1 from public.profiles p where p.id = u.id
);

-- Verify the backfill
select 'Backfill complete. Profiles created:' as status,
    count(*) filter (where p.id is not null) as profiles_count
from auth.users u
left join public.profiles p on p.id = u.id;