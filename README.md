# 우리가족 미션달성 앱 · 주호·주아의 하루 미션 🐱🍑

`family_mission_app_plan.docx` 서비스 기획서(v1.0)를 바탕으로 만든 **가족 미션 모바일 앱 프로토타입**입니다.
두 자녀(주호=춘식이, 주아=어피치)가 매일 미션을 체크·전송하고, 부모가 승인·피드백·관리합니다.
카카오프렌즈 감성(옐로우 `#FEE500`, 둥근 고딕, 큰 버튼)으로 디자인했습니다.

## 실행 방법

```bash
npm install      # 최초 1회
npm run dev      # 개발 서버 (http://localhost:5173)
```

- PC 브라우저에서는 가운데 **폰 목업 프레임**으로 보이고, 상단의 **🧒 자녀 / 👩‍👧 부모 토글**로 두 역할을 오갈 수 있습니다.
- 휴대폰(또는 좁은 화면)에서는 **풀스크린 앱**처럼 표시됩니다. 같은 와이파이라면 `npm run dev` 실행 시 표시되는 `Network` 주소(예: `http://192.168.0.102:5173`)로 폰에서 접속해 보세요.
- 부모 로그인은 데모라 **아무 값이나 입력하거나 버튼만 눌러도** 로그인됩니다.

## 캐릭터 이미지 교체 (주호=춘식이 / 주아=어피치)

현재 캐릭터는 실제 이미지가 없으면 **브랜드 컬러 원 + 이모지(🐱/🍑) 임시 아바타**로 표시됩니다.
실제 카카오프렌즈 이미지를 쓰려면:

1. **춘식이(좌) + 어피치(우)** 가 나란히 있는 이미지를 아래 경로에 저장
   `src/assets/kakao/juho_jua.png` (jpg/webp도 가능)
2. 크롭 스크립트 실행 — 좌/우로 잘라 투명 배경 아바타를 자동 생성
   ```bash
   python scripts/crop_assets.py
   ```
   → `public/kakao/choonsik.png`, `public/kakao/apeach.png` 생성 → 앱에 자동 반영
3. 개별 파일을 직접 넣어도 됩니다: `public/kakao/choonsik.png`, `public/kakao/apeach.png`

> 원본 단체 이미지(`1.jpeg`, `2.jpeg`, `카카오프렌즈1.webp`)는 스플래시·로그인 배너로 사용됩니다.
> 카카오프렌즈 캐릭터는 저작권이 있으므로 **가족 내부용(비공개)** 으로만 사용하세요.

## 주요 기능 (기획서 대응)

### 자녀 화면
- **캐릭터 선택** — 주호/주아 카드, 선택 기억(localStorage)
- **오늘의 미션 홈** — 날짜 자동 표시, 진행률 바+스트릭, 카테고리별 미션, 원형 체크(⬜/✅/📮/⭐), **완료 전송(폭죽)**, 하단 고정 가족 규칙
- **달력·기록** — 월 달력에 날짜별 달성률 색상, 과거 수행 이력 조회
- **대화** — 부모와 채팅형 소통, 칭찬 스티커/이모지

### 부모 화면
- **로그인 · 자녀 선택**
- **대시보드** — 요약 카드, 오늘 달성률 도넛, 주간/월간 추이 그래프, 승인 대기 알림
- **미션 승인** — 항목별 승인✔/반려✖/코멘트, 모두 승인, 승인 시 자녀 화면에 ⭐도장
- **미션 관리** — 추가·수정·삭제·순서변경·기간 지정 (자녀별 분리)
- **설정** — 캐릭터 매칭 변경, 초기 데이터 리셋

## 기술 구성

- React 18 + Vite + TypeScript · react-router-dom (HashRouter)
- 상태·저장: React Context + `localStorage` (백엔드 없이 동작, 새로고침해도 유지)
- 달성률 도넛/추이: 커스텀 SVG · 폭죽: canvas-confetti
- 폰트: Jua / Gaegu / Do Hyeon (Google Fonts)

## 폴더 구조

```
src/
  App.tsx            라우팅 · 역할 토글 · 폰 프레임 · 로그인 상태
  store.tsx          상태 스토어 + 파생 셀렉터(진행률/달성률/스트릭)
  data/seed.ts       초기 미션 16개 + 예시 과거 기록
  lib/               types · date · categories · confetti
  components/        CharacterAvatar · DonutChart · TrendChart · Nav · Toast
  screens/child/     CharacterSelect · Home · Calendar · Chat
  screens/parent/    Login · ChildSelect · Dashboard · Approve · MissionManage · Settings
  assets/kakao/      원본 이미지(배너)
public/kakao/        크롭된 캐릭터 아바타 + 배너
scripts/crop_assets.py  캐릭터 크롭 스크립트
```

## 데이터 초기화

앱 내 **부모 → 설정 → 초기 데이터로 리셋** 또는 브라우저에서 `localStorage.removeItem('hfm.v1')` 후 새로고침.

---
🐱 주호 · 🍑 주아 — 오늘도 미션 화이팅!
