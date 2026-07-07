# 🤖 주문형 멀티 에이전트 소스코드 생성 플랫폼 (Meta-AI Factory)

사용자가 원하는 AI 팀의 주제를 입력하면, 로컬 LLM 환경을 기반으로 맞춤형 CrewAI 멀티 에이전트 아키텍처를 설계하고 정석 파이썬 소스코드를 동적으로 빌드해 주는 캡스톤 디자인 졸업작품 프로젝트입니다.

---

## 🏛️ 시스템 아키텍처 개요
* **Frontend**: React + TypeScript (Vite)
* **Backend**: FastAPI (Uvicorn), Async Pydantic Pipeline
* **Orchestrator Engine**: CrewAI (최신 비동기 `kickoff_async` 아키텍처)
* **Local LLM**: Ollama (Qwen2.5-Coder-14B 모델)

---

## 🚀 단계별 실행 및 가동 가이드

### 1단계: 로컬 LLM (Ollama) 환경 세팅
본 프로젝트는 외부 API Key 없이 **100% 로컬 GPU 인프라** 환경에서 작동합니다. (최소 VRAM 8GB 이상 권장)

1. [Ollama 공식 홈페이지](https://ollama.com/)에서 Windows용 설치 파일을 다운로드하여 설치합니다.
2. 터미널(CMD 또는 PowerShell)을 열고 Ollama가 정상 설치되었는지 확인합니다:
   ```bash
   ollama --version
에이전트 설계 및 코드 생성을 담당할 14B 코드 모델을 다운로드하고 백그라운드에 가동시킵니다:

Bash
ollama run qwen2.5-coder:14b
Note: 최초 실행 시 약 9GB의 모델 다운로드가 진행됩니다. 터미널 창에 >>> 입력 대기 상태가 뜨면 준비가 완료된 것이며, /exit로 빠져나올 수 있습니다.

### 2단계: 백엔드(FastAPI) 서버 가동
React 프론트엔드의 요청을 받아 로컬 LLM과 CrewAI 비동기 루프를 중재하는 서버입니다.

프로젝트 루트 폴더(capstone_ai_team/)에서 파이썬 가상환경을 활성화하고 필수 패키지를 설치합니다:

Bash
# 가상환경 활성화
.venv\Scripts\activate

# 의존성 패키지 설치
pip install fastapi uvicorn crewai pydantic axios watchfiles
FastAPI 백엔드 서버를 실행합니다:

Bash
python main.py
터미널 콘솔에 INFO: Uvicorn running on http://0.0.0.0:8000 문구가 유지되는지 확인합니다.

검증: 브라우저에서 http://localhost:8000/docs에 접속했을 때 대화형 Swagger API 문서가 열리면 성공입니다.

### 3단계: 프론트엔드(React + TypeScript) 구동
사용자에게 세련된 UI를 제공하고 생성된 코드를 제어하는 대시보드 웹앱입니다.

파이참에서 새 터미널 창을 하나 더 열고 frontend 하위 폴더로 이동합니다:

Bash
cd frontend
Node.js 패키지 및 통신 라이브러리를 일괄 설치합니다:

Bash
npm install
npm install axios
리액트 개발 서버를 가동합니다:

Bash
npm run dev
터미널에 안내되는 로컬 웹 주소(http://localhost:5173)를 브라우저로 엽니다.

### 4단계: 최종 통합 테스트 흐름
브라우저에서 리액트 대시보드 화면(http://localhost:5173)을 확인합니다.

인풋창에 유저 맞춤형 요구사항을 입력합니다.

예시: “주식 시장 데이터를 분석하고 리포트를 써주는 금융 투자 AI 팀”

[AI 크루 주문하기] 버튼을 클릭합니다.

백엔드 터미널 창에 📥 [프론트 수신] 새로운 AI 팀 요청: ... 로그가 찍히며 그래픽카드(로컬 LLM) 연산이 시작됩니다.

약 30~40초 후 엄격한 아키텍처 지침이 반영된 순수 CrewAI 파이썬 소스코드가 화면 하단에 왼쪽 정렬되어 깔끔하게 출력됩니다.

우측 상단에 동적으로 나타나는 [📋 코드 복사] 버튼 및 [💾 파일 다운로드 (.py)] 버튼을 이용해 완성된 뼈대 코드를 즉시 추출하여 로컬 환경에 배포 및 실행할 수 있습니다.
