# AdSense Submission Checklist

배포 및 AdSense 신청 전에 아래 값을 실제 운영 정보로 교체하세요.

## 반드시 교체할 항목

- `https://example.com`
  - HTML canonical URL
  - Open Graph URL
  - JSON-LD URL
  - `sitemap.xml`
  - `robots.txt`
- `limkh930724@gmail.com`
  - `contact.html`의 운영자 문의 이메일로 반영되어 있습니다.
- Google AdSense 승인 후 발급되는 게시자 ID
  - 승인 또는 안내를 받은 뒤 `ads.txt`를 추가하세요.
  - 예: `google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0`
  - 실제 게시자 ID 없이 가짜 `ads.txt`를 만들지 마세요.

## 신청 전 확인

- 모든 필수 페이지가 실제 URL로 접속되는지 확인합니다.
- Contact 페이지의 이메일이 실제 수신 가능한지 확인합니다.
- Privacy Policy에 광고와 쿠키 안내가 포함되어 있는지 확인합니다.
- 계산기 페이지 하단 설명 콘텐츠가 충분한지 확인합니다.
- 빈 광고 영역, 준비중 페이지, 내용 없는 카테고리가 없는지 확인합니다.
- 모바일에서 입력 폼과 결과 영역이 겹치지 않는지 확인합니다.
- 계산 결과 주변에 참고용 문구와 투자 책임 안내가 보이는지 확인합니다.

## 현재 사이트 구성

- `/`
- `/fire-calculator`
- `/about`
- `/privacy`
- `/terms`
- `/contact`
- `/disclaimer`

Cloudflare Pages에 배포할 때는 프로젝트 루트를 그대로 업로드하면 됩니다. 빌드 명령은 필요하지 않습니다.
