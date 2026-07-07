import React, { useState } from 'react';
import axios from 'axios';

interface TopicRequest {
  user_request: string;
}

interface CrewGenerationResponse {
  status: string;
  topic: string;
  generated_code: string;
}

export const CrewFactory: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>(''); // 초기값을 빈 문자열로 변경
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleGenerate = async (): Promise<void> => {
    if (!topic.trim()) {
      alert('주제를 입력해주세요!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsCopied(false);
    setGeneratedCode(''); // 생성 시작할 때 이전 코드창 비우기

    try {
      const response = await axios.post<CrewGenerationResponse>(
        'http://localhost:8000/api/generate-crew',
        { user_request: topic } as TopicRequest
      );

      if (response.data.status === 'success') {
        setGeneratedCode(response.data.generated_code);
      } else {
        setError('코드 생성에 실패했습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 📋 클립보드 복사 기능
  const handleCopy = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      alert('복사에 실패했습니다.');
    }
  };

  // 💾 메모장(.py) 다운로드 기능
  const handleDownload = () => {
    if (!generatedCode) return;
    const element = document.createElement("a");
    const file = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "generated_crew.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 💡 실제 유효한 소스코드가 생성되었는지 판별하는 조건
  const isCodeAvailable = generatedCode.trim().length > 0 && !isLoading;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#1e293b' }}>🤖 주문형 AI 에이전트 소스코드 생성기</h2>
      <p style={{ color: '#64748b' }}>원하는 AI 팀의 주제를 입력하면, 백엔드의 14B 로컬 모델이 가동되어 CrewAI 소스코드를 빌드합니다.</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={topic}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
          placeholder="예: 주식 시장 데이터를 분석하고 리포트를 써주는 금융 투자 AI 팀"
          disabled={isLoading}
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px' }}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isLoading ? '생성 중...' : 'AI 크루 주문하기'}
        </button>
      </div>

      {isLoading && <p style={{ color: '#d97706', fontWeight: 'bold' }}>⏳ 로컬 LLM이 생각하는 중입니다... 약 30초 소요됩니다.</p>}
      {error && <p style={{ color: '#dc2626', fontWeight: 'bold' }}>❌ {error}</p>}

      {/* 🎯 [변경 핵심 부위] 소스코드가 성공적으로 생성되었을 때만 버튼과 결과창이 통째로 등장 */}
      {isCodeAvailable && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', marginBottom: '10px' }}>
            <h3 style={{ color: '#1e293b', margin: 0, textAlign: 'left' }}>🏆 생성된 정석 소스코드 결과</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopy}
                style={{ padding: '6px 12px', backgroundColor: isCopied ? '#16a34a' : '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
              >
                {isCopied ? '✓ 복사 완료!' : '📋 코드 복사'}
              </button>
              <button
                onClick={handleDownload}
                style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
              >
                💾 파일 다운로드 (.py)
              </button>
            </div>
          </div>

          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '20px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};