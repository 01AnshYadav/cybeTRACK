create or replace function handle_new_user()
    returns trigger
    language plpgsql
    security definer
    set search_path to public
as $$
begin
    insert into public.profiles (id, username, display_name)
        values (
            new.id,
            coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
            coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
        )
    on conflict (id) do nothing;

    return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function handle_new_user();