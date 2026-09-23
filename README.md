# MOVE OS

개인용 이사 관리 웹앱. 일정·할 일·비용·지급·업체를 한 프로젝트 안에서 관리합니다.

- Next.js(TypeScript) + Tailwind CSS, Netlify 배포
- 로그인 없이 누구나 접속해 바로 씁니다. 데이터는 서버가 아니라 **접속한 기기의 브라우저(localStorage)에만** 저장됩니다 — 다른 기기·브라우저에서는 보이지 않고, 브라우저 저장공간을 지우면 함께 사라집니다.

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
