# MOVE OS

개인용 이사 관리 웹앱. 일정·할 일·비용·지급·업체를 한 프로젝트 안에서 관리합니다.

- 화면·저장 API: Next.js(TypeScript) + Tailwind CSS, Netlify 배포
- 실제 데이터(일정·비용 등)는 이 저장소가 아니라 별도의 **비공개** 저장소(`heen1987-ops/Test-001-app-data-`)에 JSON으로 저장됩니다. 이 저장소에는 코드만 있습니다.
- 로그인: GitHub OAuth, 지정된 계정 1명만 허용

## 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 검사
- `npm test` — 단위 테스트 (Vitest)

## 진행 상태

단계별 구현 계획은 프로젝트 소유자의 로컬 계획 파일을 따릅니다 (Phase 0: 스캐폴드 → Phase 1: 로컬 저장 기반 화면 → Phase 2: GitHub 저장 연동 코드 → Phase 3: 배포·인증 외부 설정 → Phase 4 이후: 실제 연결 및 마감).
