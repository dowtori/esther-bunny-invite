# 틈결 × 에스더버니 아뜰리에 캠페인 결과보고서

> 파일: `esther-campaign-report.html`  
> 배포 URL: https://teumgyul.vercel.app/esther-campaign-report  
> 캠페인 기간: 2026.05.01 – 05.03 · 서울 성수동 틈결

---

## 1. 프로젝트 개요

틈결 × 에스더버니 아뜰리에 오프닝 행사(2026.05.01–03)에 맞춰 진행한 인플루언서 마케팅 캠페인의 최종 결과보고서 슬라이드덱.  
기존 전략 피치덱(`esther-campaign-pt.html`)과 동일한 UI 시스템을 재사용해 제작.  
현재 **모든 수치 데이터는 플레이스홀더(`—`)** 상태 — 피처링(featuring.co) 리포트 수신 후 교체 예정.

### 파일 위치

| 파일 | 용도 |
|------|------|
| `teumgyul/esther-campaign-report.html` | 결과보고서 슬라이드덱 (이 파일) |
| `teumgyul/esther-campaign-pt.html` | 원본 전략 제안 피치덱 (UI 레퍼런스) |
| `teumgyul/images/lily.webp` | 릴리(엔믹스) 프로필 이미지 |
| `teumgyul/images/kimgoeun.webp` | 김고은 프로필 이미지 |
| `teumgyul/images/데패뉴 콘텐츠1.png` | 데패뉴 피드 콘텐츠 썸네일 |
| `teumgyul/images/엔믹스 스토리.png` | 릴리 스토리 콘텐츠 |
| `teumgyul/images/데패뉴 스토리.png` | 데패뉴 스토리 콘텐츠 |

---

## 2. 슬라이드 구조 (S0–S6)

### S0 — Cover (다크)
- 배경: `#0E0C0A` 오버라이드 (인라인 style)
- 타이틀: "틈결 에스더버니 / Campaign Report"
- 서브: "2026.05.01 — 05.03 · 서울 성수동 틀결"
- 배지: "CAMPAIGN COMPLETE" / "CONFIDENTIAL"

### S1 — KPI 총괄
- `.kpi-row` 4칸: 총 콘텐츠 수 / 예상 도달 / 총 인게이지먼트 / CPV
- `.stat-bar`: 팔로워 규모 (릴리 609만 / 김고은 145만 / 데패뉴 103만 / 합산 857만)
- 캠페인 개요 카드 + 콘텐츠 분류 카드 (2열)

### S2 — 인플루언서별 성과
- `.ic-grid` 3열: 릴리 / 김고은 / 데패뉴
- 각 카드: 팔로워 + 콘텐츠 수 + 조회수 + 좋아요 + 댓글
- 이미지: `lily.webp`, `kimgoeun.webp`, `데패뉴 콘텐츠1.png`

### S3 — 피드 콘텐츠 갤러리
- `.gallery-grid` 4×2 = 8슬롯
- 각 슬롯: 크리에이터명 + 날짜 캡션 오버레이
- Row 2 첫 번째 슬롯: `데패뉴 콘텐츠1.png` 삽입, 나머지 플레이스홀더

### S4 — 스토리 갤러리
- `.story-row` 5슬롯 (9:16 세로 비율)
- 슬롯 1: `엔믹스 스토리.png` (릴리, pink 배지)
- 슬롯 3: `데패뉴 스토리.png` (stone 배지)
- 나머지 플레이스홀더

### S5 — 나노 인플루언서 볼륨
- `.nano-kpi` 바: 릴스 90건 / 피드 — / 스토리 — / 합산 150+건
- `.nano-grid` 10×4 = 40칸 모자이크 (볼륨 시각화)
- `.stat-bar`: 피처링 협찬 / 참여 인원 — / 조회수 — / CPV —

### S6 — 인사이트 & 총평
- 왼쪽: `.blist` 성과 하이라이트 (5개 항목, 플레이스홀더)
- 오른쪽: `.reason-grid` 4칸 시사점 카드

---

## 3. 플레이스홀더 교체 가이드

### 피처링(featuring.co) 수치 교체

피처링 리포트에서 아래 값을 확인해 `esther-campaign-report.html` 내 `—` 텍스트를 교체:

| 위치 (슬라이드) | 필드 | 피처링 데이터 항목 |
|---|---|---|
| S1 `.kpi-item` | 총 콘텐츠 수 | 업로드된 콘텐츠 총 건수 |
| S1 `.kpi-item` | 예상 도달 | Estimated Reach / Impressions |
| S1 `.kpi-item` | 총 인게이지먼트 | Total Engagement |
| S1 `.kpi-item` | CPV | Cost Per View |
| S2 각 인플루언서 카드 | 조회수 / 좋아요 / 댓글 | 인플루언서별 상세 지표 |
| S5 `.nano-kpi-item` | 피드 건수 / 스토리 건수 / 합산 | 나노 인플루언서 콘텐츠 수 |
| S5 `.stat-bar` | 참여 인원 / 조회수 / CPV | 나노 캠페인 요약 |
| S6 `.blist li` | 성과 하이라이트 | 캠페인 총평 문구 |

### 이미지 교체 (Google Drive)

구글드라이브 공개 링크 패턴:
```
https://drive.google.com/uc?export=view&id=FILE_ID
```

파일 공유 URL에서 FILE_ID 추출:
- 공유 URL: `https://drive.google.com/file/d/1aBcDeFgHiJkLmN/view`
- FILE_ID: `1aBcDeFgHiJkLmN`

HTML에서 img-slot에 적용:
```html
<!-- 플레이스홀더 상태 -->
<div class="img-slot" data-label="피드 콘텐츠"></div>

<!-- 이미지 교체 후 -->
<div class="img-slot" style="background-image:url('https://drive.google.com/uc?export=view&id=1aBcDeFgHiJkLmN')" data-label="피드 콘텐츠"></div>
```

> `[style*="background-image"]` CSS 선택자로 ::before(아이콘)과 ::after(라벨)이 자동으로 숨겨짐.

---

## 4. 새로 추가된 CSS 클래스

`esther-campaign-pt.html`에 없는 클래스들 (결과보고서 전용):

```css
/* S3 피드 갤러리 */
.gallery-grid       /* 4열 × 2행 grid, height:820px */
.gallery-cell       /* position:relative, overflow:hidden */
.gallery-caption    /* 하단 그라데이션 오버레이 캡션 */

/* S4 스토리 갤러리 */
.story-row          /* flex, height:620px */
.story-slot         /* flex:1, position:relative */
.story-badge        /* 상단 좌측 크리에이터 배지 */
.story-badge.pink   /* 릴리/엔믹스용 핑크 */
.story-badge.stone  /* 데패뉴용 다크 */

/* S5 나노 볼륨 */
.nano-kpi           /* KPI 수치 바 컨테이너 */
.nano-kpi-item      /* 개별 수치 셀 */
.nano-kpi-num       /* Cormorant 56px, --pink 색 */
.nano-kpi-label     /* 라벨 텍스트 */
.nano-grid          /* 10열 × 4행 모자이크 */
.nano-cell          /* 개별 모자이크 셀 */
```

---

## 5. 배포

```bash
cd C:\Users\1004\테스트\teumgyul
npx vercel --prod
```

배포 후 접근 URL: https://teumgyul.vercel.app/esther-campaign-report

---

## 6. 다음 작업 체크리스트

- [ ] 피처링 리포트 수신 후 `—` 플레이스홀더 수치 교체
- [ ] 구글드라이브 이미지 파일 ID 확인 → img-slot src 교체
  - S3: 피드 콘텐츠 7개 슬롯 (릴리 2 / 김고은 2 / 데패뉴 2 / 기타 1)
  - S4: 스토리 슬롯 3개 (릴리 1 추가 / 김고은 1 / 기타 1)
  - S5: nano-grid 40칸 (나노 인플루언서 콘텐츠 썸네일 일부)
- [ ] S6 인사이트 문구 실제 평가 내용으로 업데이트
- [ ] `npx vercel --prod` 최종 배포

---

*Last updated: 2026-05-11 | SIRIAI × 틈결 내부 문서*
