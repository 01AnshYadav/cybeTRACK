-- Leaderboard public profiles view for ranking
-- This is a SQL view that aggregates public profile data for ranking purposes

-- Ensure achievements table has is_public column (used in leaderboard view filter)
alter table public.achievements add column if not exists is_public boolean default true not null;

-- Create a ranking view based on public profiles with achievements, streaks, and activity
create view public.leaderboard_ranking as
select
    p.id as user_id,
    p.username,
    p.display_name,
    p.is_public,
    count(distinct a.id) as achievements_earned,
    count(distinct act.id) as activities_completed,
    -- Simple streak calculation based on activity timestamps
    case when count(act.id) > 0 then
        (extract(epoch from (max(act.created_at) - min(act.created_at))) / 86400)::int
    else 0 end as days_since_first_activity,
    -- Count roadmaps completed
    count(distinct case when r.status = 'completed' then r.id end) as roadmaps_completed
from public.profiles p
left join public.achievements a on a.user_id = p.id and a.is_public = true
left join public.activity act on act.user_id = p.id
left join public.roadmaps r on r.user_id = p.id
where p.is_public = true
group by p.id, p.username, p.display_name, p.is_public
order by achievements_earned desc, activities_completed desc;

-- Grant select on the view
grant select on public.leaderboard_ranking to authenticated;