# 설치 작업표 (PWA)

## 배포 방법 (Vercel)

1. 이 폴더 안의 파일 전체를 깃허브 저장소에 업로드 (드래그 앤 드롭 가능)
2. vercel.com → GitHub 로그인 → 저장소 Import → Deploy
3. Vercel 프로젝트 → Settings → Environment Variables 에서
   - Key: `ANTHROPIC_API_KEY`
   - Value: (console.anthropic.com에서 발급받은 키, sk-ant-로 시작)
   등록 후 Deployments 탭에서 Redeploy
4. 배포된 주소를 폰으로 열고 "홈 화면에 추가"

## 폴더 구성
- `index.html` — 앱 화면 전체 (목록/등록/매출)
- `manifest.json` — 앱 이름, 아이콘, 색상 정의 (PWA 필수)
- `sw.js` — 오프라인에서도 화면이 뜨도록 캐싱하는 서비스워커
- `api/parse-order.js` — 사진 속 주문 정보를 AI로 읽어주는 서버 함수 (API 키를 안전하게 보관)
- `icons/` — 앱 아이콘 (192px, 512px)

## 데이터는 어디에 저장되나요?
남편분 폰 브라우저의 localStorage에 저장돼요. 즉 **이 앱을 설치한 그 폰에만** 데이터가 남아요.
다른 기기(PC 등)에서 같은 데이터를 보려면 별도 서버 저장소가 필요해요 — 필요해지면 알려주세요, 다음 단계로 준비해드릴게요.
