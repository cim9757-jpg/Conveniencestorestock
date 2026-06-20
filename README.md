# 🏪 재고모아 - 편의점 실시간 재고 확인 서비스

> **SW 프로그래밍 실습 과제 제출물**  
> **개발 환경:** Python 3.x, Flask, SQLite, HTML5, Vanilla CSS, JavaScript (Leaflet.js)

---

## 1. 서비스 개요 및 목적
본 서비스는 소비자가 원하는 상품을 검색하고, 주변 편의점의 재고 상태를 실시간으로 조회하여 불필요한 방문(헛걸음)을 방지해주는 위치 기반 재고 확인 웹 서비스입니다. 
주요 타겟층은 편의점의 한정 상품, 인기 상품(예: 신상 라면, 완판 스낵 등)을 자주 찾는 학생 및 직장인 소비자입니다.

---

## 2. 주요 핵심 기능
*   **회원 기능 (Authentication):**
    *   아이디와 비밀번호를 기반으로 한 직관적인 회원가입 및 세션 유지 로그인 기능 제공.
*   **상품 검색 기능 (Search):**
    *   검색창에 상품명을 입력하여 관련 상품 리스트 조회.
    *   카테고리 퀵 태그(라면, 간편식, 스낵, 음료, 아이스크림 등)를 이용한 간편 필터링 검색 제공.
*   **위치 기반 주변 편의점 조회 (Location-based Service):**
    *   브라우저 Geolocation API를 통해 사용자의 현재 위도, 경도 좌표를 획득.
    *   현재 위치를 기준으로 주변 편의점(CU, GS25, 세븐일레븐, 이마트24 등) 목록을 거리순으로 자동 정렬하여 표시.
*   **실시간 재고 조회 및 지도 시각화 (Stock View & Map):**
    *   오픈소스 지도 라이브러리인 **Leaflet.js**와 **OpenStreetMap**을 사용하여 API 키 없이도 지도 상에 편의점 위치를 표시.
    *   재고 상태를 **있음 (4개 이상 / 초록)**, **소량 (1~3개 / 주황)**, **없음 (0개 / 빨강)**의 세 단계 직관적인 뱃지로 시각화.
    *   지도 마커 또는 사이드바의 편의점 카드를 클릭하면 해당 매장의 정보와 상세 재고 상태 팝업이 노출되는 유기적 연동 구현.

---

## 3. 기술 스택 및 구현 방식
*   **Back-end:** `Python`, `Flask`, `Flask-SQLAlchemy` (SQLite ORM), `Flask-Login` (세션 관리)
*   **Front-end:** `HTML5`, `Vanilla CSS` (Modern Theme & Glassmorphism UI), `JavaScript` (Geolocation API, Leaflet.js Map)
*   **Database:** `SQLite` (가볍고 관리가 간편한 임베디드 파일형 DB)

---

## 4. 디렉터리 구조
```text
convenience_store_stock/
│
├── app.py                 # Flask 메인 애플리케이션 (컨트롤러 & API 라우팅)
├── models.py              # 데이터베이스 모델 정의 및 초기 더미 데이터 생성 로직
├── test_app.py            # 단위 테스트 코드 (회원가입, 로그인, 검색, API 테스트)
├── requirements.txt       # 의존성 패키지 정의 목록
├── .gitignore             # Git 관리 제외 대상 정의
├── README.md              # 프로젝트 안내 문서 (본 문서)
│
├── static/                # 정적 자원 폴더
│   ├── css/
│   │   └── style.css      # 메인 스타일시트 (다크/라이트 테마 변수 및 반응형 CSS)
│   └── js/
│       └── main.js        # 위치 정보 획득, API 통신, 지도 렌더링 스크립트
│
└── templates/             # HTML 템플릿 폴더 (Jinja2)
    ├── base.html          # 공통 레이아웃 헤더 및 푸터
    ├── index.html         # 메인 홈 화면 (검색창, 인기 상품 목록)
    ├── search_results.html# 상품 검색 결과 목록 화면
    ├── stock_view.html    # 재고 확인 및 지도 연동 화면
    ├── login.html         # 글래스모피즘 로그인 화면
    └── register.html      # 회원가입 화면
```

---

## 5. 설치 및 로컬 실행 방법

### 1) Python 설치 확인
컴퓨터에 Python이 설치되어 있어야 합니다. (Python 3.8 이상 권장)

### 2) 가상환경 구성 및 패키지 설치
터미널 또는 명령 프롬프트(CMD)를 실행하여 프로젝트 폴더로 이동한 뒤 아래 명령어를 차례로 입력합니다.

```bash
# 프로젝트 폴더로 이동
cd convenience_store_stock

# 가상환경(venv) 생성
python -m venv venv

# 가상환경 활성화 (Windows Command Prompt)
venv\Scripts\activate

# 가상환경 활성화 (Mac / Linux / Git Bash)
source venv/bin/activate

# 의존성 라이브러리 설치
pip install -r requirements.txt
```

### 3) 서비스 실행
```bash
# Flask 서버 기동
python app.py
```
서버 실행 후 웹 브라우저를 열고 `http://127.0.0.1:5000`에 접속합니다.

### 4) 단위 테스트 실행 방법
```bash
# 비즈니스 로직 및 API 통합 테스트 실행
python test_app.py
```

---

## 6. 데이터베이스 및 더미 데이터 정보
*   **재고:** 매장별, 상품별로 0~10개 사이의 무작위 재고가 자동으로 할당되어 즉시 실감나는 테스트 가능

---

## 7. GitHub 및 클라우드 배포 방법

이 프로젝트는 Python(Flask) 백엔드와 SQLite 데이터베이스를 사용하므로, 정적 페이지만 호스팅 가능한 **GitHub Pages에 직접 배포는 불가능**합니다. 대신 GitHub 저장소와 연동하여 아래 클라우드 플랫폼을 통해 무료로 배포할 수 있습니다.

### 1단계: GitHub에 소스 코드 올리기
1. GitHub에서 새로운 public 또는 private 저장소(Repository)를 만듭니다. (예: `convenience-store-stock`)
2. 로컬 컴퓨터의 프로젝트 폴더에서 터미널을 열고 아래 명령어를 실행하여 소스코드를 GitHub에 업로드합니다.
```bash
# git 초기화 및 첫 커밋
git init
git add .
git commit -m "feat: 편의점 재고 서비스 완성"

# 기본 브랜치를 main으로 설정
git branch -M main

# GitHub 저장소 연결 (원격 저장소 주소는 본인의 GitHub 주소 입력)
git remote add origin https://github.com/사용자이름/저장소이름.git

# 코드 푸시
git push -u origin main
```

---

### 2단계: 클라우드 플랫폼에 배포하기 (택일)

#### 방법 A: Render.com 이용하기 (가장 쉽고 권장됨)
Render는 GitHub 저장소와 연결하여 코드가 업데이트(Push)될 때마다 자동으로 빌드 및 배포를 수행해 줍니다.
1. [Render 공식 사이트](https://render.com/)에 접속하여 GitHub 계정으로 가입/로그인합니다.
2. 대시보드 우측 상단의 **[New +]** -> **[Web Service]**를 클릭합니다.
3. **[Build and deploy from a Git repository]**를 선택하고 1단계에서 푸시한 저장소를 연결합니다.
4. 웹 서비스 설정을 아래와 같이 입력합니다:
   - **Name**: `convenience-store-stock` (원하는 이름)
   - **Region**: 가까운 리전 선택 (예: Singapore, Oregon)
   - **Branch**: `main`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (requirements.txt에 추가된 gunicorn 서버를 사용해 기동)
   - **Instance Type**: **Free** (무료 플랜 선택)
5. **[Create Web Service]** 버튼을 누르면 빌드가 시작되며, 수 분 내로 제공되는 무료 URL(`https://서비스이름.onrender.com`)을 통해 접속 가능합니다.

> [!WARNING]
> Render의 Free 플랜은 서버가 15분 이상 요청을 받지 않으면 슬립 모드로 진입합니다. 이후 첫 접속 시 서버가 깨어나는 데 약 50초~1분 정도 소요될 수 있습니다. 또한, SQLite 파일 DB를 사용하므로 서버가 재시작(슬립 모드에서 깨어나거나 새 배포 시)될 때마다 데이터베이스 파일이 리셋되어 회원 데이터 및 재고 데이터가 초기 설정(더미 데이터 상태)으로 되돌아갑니다.

---

#### 방법 B: PythonAnywhere.com 이용하기 (영구 파일 보존 필요 시)
SQLite 파일이 재부팅으로 지워지지 않고 계속 보존되기를 바란다면 PythonAnywhere의 무료 플랜을 추천합니다.
1. [PythonAnywhere 공식 사이트](https://www.pythonanywhere.com/)에 가입 후 로그인합니다.
2. **Consoles** 탭에서 **Bash console**을 하나 엽니다.
3. GitHub 저장소의 코드를 복제(Clone)하고 가상환경을 구성합니다:
   ```bash
   git clone https://github.com/사용자이름/저장소이름.git
   cd 저장소이름
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
4. **Web** 탭으로 이동하여 **[Add a new web app]**을 클릭합니다.
   - 도메인 설정 단계는 [Next]를 눌러 기본 제공 도메인으로 선택합니다.
   - Select Web Framework 단계에서는 **Manual configuration** 및 현재 파이썬 버전을 선택합니다.
5. 웹 앱 설정 화면에서 다음 항목들을 지정합니다:
   - **Code** 섹션:
     - **Source code**: `/home/본인ID/저장소이름`
     - **Working directory**: `/home/본인ID/저장소이름`
     - **WSGI configuration file**: 링크를 클릭하여 내부 파일을 열고, 기존 코드를 모두 지운 후 아래 코드를 작성하고 저장합니다.
       ```python
       import sys
       path = '/home/본인ID/저장소이름'
       if path not in sys.path:
           sys.path.append(path)
       from app import app as application
       ```
   - **Virtualenv** 섹션:
     - **Virtualenv path**: `/home/본인ID/저장소이름/venv`
6. 대시보드 맨 위로 돌아가 **[Reload 본인ID.pythonanywhere.com]** 버튼을 클릭하면 배포가 완료됩니다.

