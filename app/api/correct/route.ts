import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    // LLM을 사용한 문법 교정 (실제로는 OpenAI API나 다른 LLM 서비스를 사용)
    // 여기서는 샘플로 간단한 교정 로직을 구현
    // 실제 프로덕션에서는 OpenAI API를 사용하는 것을 권장합니다
    
    const correctedText = await correctGrammar(text);
    
    // 의미 있는 변경이 있는지 확인 (대소문자나 공백만 다른 경우는 제외)
    const hasError = normalizeText(text) !== normalizeText(correctedText);

    return NextResponse.json({
      original: text,
      corrected: correctedText,
      hasError: hasError,
    });
  } catch (error) {
    console.error('교정 오류:', error);
    return NextResponse.json(
      { error: '교정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 개선된 문법 교정 함수
// 실제로는 OpenAI API를 사용하는 것을 권장합니다
async function correctGrammar(text: string): Promise<string> {
  let corrected = text.trim();
  if (!corrected) return corrected;
  
  const original = corrected;
  
  // 1단계: 공백 정리 (먼저 처리)
  corrected = corrected.replace(/\s+/g, ' ').trim();
  
  // 2단계: 소문자 i를 대문자 I로 교정 (단어 경계 확인)
  corrected = corrected.replace(/\bi\b/g, (match, offset) => {
    // 문장 시작이거나 앞에 공백/구두점이 있는 경우
    if (offset === 0 || /[\s.!?]/.test(corrected[offset - 1])) {
      return 'I';
    }
    return match;
  });
  
  // 3단계: 축약형 오류 교정
  const contractions: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bdont\b/gi, replacement: "don't" },
    { pattern: /\bdoesnt\b/gi, replacement: "doesn't" },
    { pattern: /\bdidnt\b/gi, replacement: "didn't" },
    { pattern: /\bisnt\b/gi, replacement: "isn't" },
    { pattern: /\barent\b/gi, replacement: "aren't" },
    { pattern: /\bwasnt\b/gi, replacement: "wasn't" },
    { pattern: /\bwerent\b/gi, replacement: "weren't" },
    { pattern: /\bhavent\b/gi, replacement: "haven't" },
    { pattern: /\bhasnt\b/gi, replacement: "hasn't" },
    { pattern: /\bhadnt\b/gi, replacement: "hadn't" },
    { pattern: /\bwont\b/gi, replacement: "won't" },
    { pattern: /\bcant\b/gi, replacement: "can't" },
    { pattern: /\bcouldnt\b/gi, replacement: "couldn't" },
    { pattern: /\bshouldnt\b/gi, replacement: "shouldn't" },
    { pattern: /\bwouldnt\b/gi, replacement: "wouldn't" },
    { pattern: /\bim\b/gi, replacement: "I'm" },
    { pattern: /\byoure\b/gi, replacement: "you're" },
    { pattern: /\bhes\b/gi, replacement: "he's" },
    { pattern: /\bshes\b/gi, replacement: "she's" },
    { pattern: /\bits\b/gi, replacement: "it's" },
    { pattern: /\bwere\b/gi, replacement: "we're" },
    { pattern: /\btheyre\b/gi, replacement: "they're" },
  ];
  
  for (const { pattern, replacement } of contractions) {
    corrected = corrected.replace(pattern, replacement);
  }
  
  // 4단계: 주어-동사 일치 오류 교정
  const subjectVerbAgreement: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bthey\s+is\b/gi, replacement: 'they are' },
    { pattern: /\bthey\s+was\b/gi, replacement: 'they were' },
    { pattern: /\bhe\s+are\b/gi, replacement: 'he is' },
    { pattern: /\bhe\s+were\b/gi, replacement: 'he was' },
    { pattern: /\bshe\s+are\b/gi, replacement: 'she is' },
    { pattern: /\bshe\s+were\b/gi, replacement: 'she was' },
    { pattern: /\bit\s+are\b/gi, replacement: 'it is' },
    { pattern: /\bit\s+were\b/gi, replacement: 'it was' },
    { pattern: /\bi\s+are\b/gi, replacement: 'I am' },
    { pattern: /\bi\s+is\b/gi, replacement: 'I am' },
    { pattern: /\bi\s+was\b/gi, replacement: 'I was' },
    { pattern: /\byou\s+is\b/gi, replacement: 'you are' },
    { pattern: /\byou\s+was\b/gi, replacement: 'you were' },
    { pattern: /\bwe\s+is\b/gi, replacement: 'we are' },
    { pattern: /\bwe\s+was\b/gi, replacement: 'we were' },
  ];
  
  for (const { pattern, replacement } of subjectVerbAgreement) {
    corrected = corrected.replace(pattern, replacement);
  }
  
  // 5단계: 동사 시제 오류 교정
  const verbTense: Array<{ pattern: RegExp; replacement: string }> = [
    // be 동사 + go -> going
    { pattern: /\bam\s+go\b/gi, replacement: 'am going' },
    { pattern: /\bis\s+go\b/gi, replacement: 'is going' },
    { pattern: /\bare\s+go\b/gi, replacement: 'are going' },
    { pattern: /\bwas\s+go\b/gi, replacement: 'was going' },
    { pattern: /\bwere\s+go\b/gi, replacement: 'were going' },
    // 일반 동사 과거형 오류
    { pattern: /\bgo\s+yesterday\b/gi, replacement: 'went yesterday' },
    { pattern: /\bgo\s+last\b/gi, replacement: 'went last' },
    { pattern: /\bdo\s+yesterday\b/gi, replacement: 'did yesterday' },
    { pattern: /\bdo\s+last\b/gi, replacement: 'did last' },
    { pattern: /\bsee\s+yesterday\b/gi, replacement: 'saw yesterday' },
    { pattern: /\bsee\s+last\b/gi, replacement: 'saw last' },
    { pattern: /\beat\s+yesterday\b/gi, replacement: 'ate yesterday' },
    { pattern: /\beat\s+last\b/gi, replacement: 'ate last' },
  ];
  
  for (const { pattern, replacement } of verbTense) {
    corrected = corrected.replace(pattern, replacement);
  }
  
  // 6단계: 관사 오류 교정 (a + 모음으로 시작하는 단어 -> an)
  corrected = corrected.replace(/\ba\s+([aeiouAEIOU][a-zA-Z]*)\b/g, (match, word) => {
    // 예외: a university, a European 등은 그대로 유지
    if (/^[uU][a-z]*/.test(word) && word.toLowerCase().startsWith('university')) {
      return match;
    }
    return `an ${word}`;
  });
  
  // 7단계: 복수형 오류 (단수 주어 + 복수 동사, 또는 그 반대)
  // 단수 주어 + 복수 동사
  corrected = corrected.replace(/\b(he|she|it|this|that)\s+(are|were)\b/gi, (match, subject, verb) => {
    const subj = subject.toLowerCase();
    const vrb = verb.toLowerCase();
    if (vrb === 'are') return `${subj} is`;
    if (vrb === 'were') return `${subj} was`;
    return match;
  });
  
  // 8단계: 일반적인 동사 오류 교정 (간단한 패턴만)
  const commonVerbErrors: Array<{ pattern: RegExp; replacement: string }> = [
    // 3인칭 단수 -s 누락 (자주 사용되는 동사만)
    { pattern: /\bhe\s+go\b/gi, replacement: 'he goes' },
    { pattern: /\bshe\s+go\b/gi, replacement: 'she goes' },
    { pattern: /\bit\s+go\b/gi, replacement: 'it goes' },
    { pattern: /\bhe\s+do\b/gi, replacement: 'he does' },
    { pattern: /\bshe\s+do\b/gi, replacement: 'she does' },
    { pattern: /\bit\s+do\b/gi, replacement: 'it does' },
    { pattern: /\bhe\s+have\b/gi, replacement: 'he has' },
    { pattern: /\bshe\s+have\b/gi, replacement: 'she has' },
    { pattern: /\bit\s+have\b/gi, replacement: 'it has' },
    { pattern: /\bhe\s+like\b/gi, replacement: 'he likes' },
    { pattern: /\bshe\s+like\b/gi, replacement: 'she likes' },
    { pattern: /\bit\s+like\b/gi, replacement: 'it likes' },
    { pattern: /\bhe\s+want\b/gi, replacement: 'he wants' },
    { pattern: /\bshe\s+want\b/gi, replacement: 'she wants' },
    { pattern: /\bit\s+want\b/gi, replacement: 'it wants' },
    { pattern: /\bhe\s+need\b/gi, replacement: 'he needs' },
    { pattern: /\bshe\s+need\b/gi, replacement: 'she needs' },
    { pattern: /\bit\s+need\b/gi, replacement: 'it needs' },
    { pattern: /\bhe\s+see\b/gi, replacement: 'he sees' },
    { pattern: /\bshe\s+see\b/gi, replacement: 'she sees' },
    { pattern: /\bit\s+see\b/gi, replacement: 'it sees' },
    { pattern: /\bhe\s+know\b/gi, replacement: 'he knows' },
    { pattern: /\bshe\s+know\b/gi, replacement: 'she knows' },
    { pattern: /\bit\s+know\b/gi, replacement: 'it knows' },
    { pattern: /\bhe\s+think\b/gi, replacement: 'he thinks' },
    { pattern: /\bshe\s+think\b/gi, replacement: 'she thinks' },
    { pattern: /\bit\s+think\b/gi, replacement: 'it thinks' },
    { pattern: /\bhe\s+say\b/gi, replacement: 'he says' },
    { pattern: /\bshe\s+say\b/gi, replacement: 'she says' },
    { pattern: /\bit\s+say\b/gi, replacement: 'it says' },
    { pattern: /\bhe\s+get\b/gi, replacement: 'he gets' },
    { pattern: /\bshe\s+get\b/gi, replacement: 'she gets' },
    { pattern: /\bit\s+get\b/gi, replacement: 'it gets' },
    { pattern: /\bhe\s+make\b/gi, replacement: 'he makes' },
    { pattern: /\bshe\s+make\b/gi, replacement: 'she makes' },
    { pattern: /\bit\s+make\b/gi, replacement: 'it makes' },
    { pattern: /\bhe\s+take\b/gi, replacement: 'he takes' },
    { pattern: /\bshe\s+take\b/gi, replacement: 'she takes' },
    { pattern: /\bit\s+take\b/gi, replacement: 'it takes' },
  ];
  
  for (const { pattern, replacement } of commonVerbErrors) {
    corrected = corrected.replace(pattern, replacement);
  }
  
  // 9단계: 문장 시작 대문자
  if (corrected.length > 0) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  }
  
  // 10단계: 문장 끝 구두점 정리
  corrected = corrected.trim();
  if (corrected.length > 0 && !/[.!?]$/.test(corrected)) {
    corrected = corrected + '.';
  }
  
  // 11단계: 최종 공백 정리
  corrected = corrected.replace(/\s+/g, ' ').trim();
  
  // 원본과 동일하면 그대로 반환 (오류가 없는 경우)
  if (corrected.toLowerCase() === original.toLowerCase()) {
    return original;
  }
  
  return corrected;
}

// 텍스트 정규화 함수 (대소문자, 공백 제거하여 비교)
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}
