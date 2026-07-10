-- 우리가족 미션 챌린지 · 초기 스키마 (CI 자동 동기화 대상)
-- GitHub에 push 되면 GitHub Actions가 supabase db push 로 이 마이그레이션을 적용합니다.

create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 실시간(Realtime) 활성화 (이미 추가돼 있으면 무시)
do $$
begin
  begin
    alter publication supabase_realtime add table public.app_state;
  exception when duplicate_object then null;
  end;
end $$;

alter table public.app_state enable row level security;

drop policy if exists "family_all_select" on public.app_state;
drop policy if exists "family_all_insert" on public.app_state;
drop policy if exists "family_all_update" on public.app_state;

-- ⚠️ 가족 프로토타입용: 공개키로 읽기/쓰기 허용. 운영 시 Supabase Auth 기반으로 강화 권장.
create policy "family_all_select" on public.app_state for select using (true);
create policy "family_all_insert" on public.app_state for insert with check (true);
create policy "family_all_update" on public.app_state for update using (true) with check (true);
