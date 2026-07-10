-- 우리가족 미션 챌린지 · Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 아래 전체를 붙여넣고 1회 "RUN" 하세요.
-- (프로젝트: qhulwtunogbpzlbhtvcp)

-- 1) 앱 상태 저장 테이블 (가족 전체 상태를 JSON 한 행으로 저장/동기화)
create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2) 실시간(Realtime) 활성화 - 다른 기기에서 즉시 반영되도록
alter publication supabase_realtime add table public.app_state;

-- 3) RLS(행 수준 보안) 활성화
alter table public.app_state enable row level security;

-- 4) 접근 정책
--  ⚠️ 아래는 "공개(anon) 키로 누구나 읽고 쓰기 허용" 정책입니다.
--     비공개 가족 프로토타입 용도로만 사용하세요.
--     실제 운영 시에는 Supabase Auth(로그인) + auth.uid() 기반 정책으로 강화하는 것을 권장합니다.
drop policy if exists "family_all_select" on public.app_state;
drop policy if exists "family_all_insert" on public.app_state;
drop policy if exists "family_all_update" on public.app_state;

create policy "family_all_select" on public.app_state for select using (true);
create policy "family_all_insert" on public.app_state for insert with check (true);
create policy "family_all_update" on public.app_state for update using (true) with check (true);

-- 완료! 앱을 http(s)로 열면 자동으로 이 테이블과 동기화됩니다.
