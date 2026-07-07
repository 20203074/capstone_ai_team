from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from crewai import Agent, Task, Crew, Process, LLM
import re

app = FastAPI(title="Meta-AI Factory API Server", version="1.0")

# CORS 허용 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. 수신 데이터 규격
class TopicRequest(BaseModel):
    user_request: str


# 2. 로컬 LLM 설정 (qwen2.5-coder:14b)
meta_llm = LLM(
    model="ollama/qwen2.5-coder:14b",
    temperature=0.0
)

# 3. 메타 에이전트 선언
architect = Agent(
    role='CrewAI 시스템 명세 설계자',
    goal='사용자가 프론트에서 요청한 주제를 분석하여 최적의 에이전트 인원과 태스크 파이프라인을 동적으로 설계한다.',
    backstory='사용자의 요구사항을 요구조건에 맞춰 완벽한 멀티 에이전트 아키텍처 명세서로 설계하는 명장입니다.',
    verbose=True,
    llm=meta_llm
)

generator = Agent(
    role='범용 CrewAI 소스코드 빌더',
    goal='설계서를 바탕으로 즉시 실행 가능한 정석 CrewAI 파이썬 소스코드를 동적으로 완벽하게 생성한다.',
    backstory='마크다운 백틱 없이 완벽한 순수 파이썬 객체 구조(Agent, Task, Crew)로만 구성된 코드를 빌드하는 완벽주의 엔지니어입니다.',
    verbose=True,
    llm=meta_llm
)


# 코드 정제 필터
def clean_generated_code(raw_content: str) -> str:
    code_match = re.search(r'```python\s*(.*?)\s*```', raw_content, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
    return raw_content.replace("```python", "").replace("```", "").strip()


# ====================================================================
# 🎯 [POST 엔드포인트] 비동기 처리(async/await)가 반영된 안전한 라우터
# ====================================================================
@app.post("/api/generate-crew")
async def generate_crew_code(request: TopicRequest):
    try:
        print(f"📥 [프론트 수신] 새로운 AI 팀 요청: {request.user_request}")

        # 4. 태스크 동적 정의
        task_design = Task(
            description=f'사용자 요구사항: "{request.user_request}"\n위 목적에 맞는 새로운 AI 크루를 설계하여 아키텍처 설계서를 마크다운으로 작성해줘.',
            expected_output='사용자 맞춤형 AI 크루 아키텍처 설계 명세서',
            agent=architect
        )

        task_build = Task(
            description=(
                "앞선 설계서를 바탕으로 사용자가 즉시 실행할 수 있는 독립된 파이썬 소스코드를 생성해라.\n\n"
                "⚠️ [초강력 소스코드 빌드 지침]:\n"
                "1. 결과 본문에 마크다운 백틱(```) 기호를 절대로 포함하지 마라.\n"
                "2. 반드시 CrewAI 표준 객체 규격(model='ollama/qwen2.5-coder:14b', temperature=0.0)을 적용해 코딩해라.\n"
                "3. 사용자가 코드를 받아 즉시 실행 흐름을 테스트해볼 수 있도록 `if __name__ == '__main__':` 블록 내부에 "
                "사용자가 요청한 주제에 걸맞은 가상의 sample_input 데이터셋과 inputs 매핑 코드를 무조건 탑재해라."
            ),
            expected_output='설계 요구사항이 100% 반영된 순수 파이썬 소스 코드 스트링',
            agent=generator
        )

        # 5. 메타 팩토리 크루 결성
        factory_crew = Crew(
            agents=[architect, generator],
            tasks=[task_design, task_build],
            process=Process.sequential
        )

        # 💡 핵심 수정 포인트: async 환경에 맞춰 await 키워드와 kickoff_async() 메서드 사용!
        raw_result = await factory_crew.kickoff_async()

        # 6. 소스코드 정제
        final_clean_code = clean_generated_code(str(raw_result))

        print("✨ [성공] 맞춤형 AI 크루 코드가 동적 빌드되어 성공적으로 전송됩니다.")

        return {
            "status": "success",
            "topic": request.user_request,
            "generated_code": final_clean_code
        }

    except Exception as e:
        print(f"❌ [에러] {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI 크루 생성 중 서버 내부 에러 발생: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)