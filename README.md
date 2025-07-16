# 감정일기 (Emotion Journal) 📝

당신의 마음을 기록하고 분석하는 감정일기 웹 서비스입니다.

## ✨ 주요 기능

- **📝 일기 작성**: 자유롭게 일기를 작성하고 감정을 기록
- **🧠 감정 분석**: 텍스트 분석을 통한 감정 점수 및 분석 결과 제공
- **📊 결과 시각화**: 감정 트렌드와 통계를 한눈에 확인
- **🎵 음악 추천**: 감정에 맞는 음악 추천 시스템
- **👤 사용자 인증**: 회원가입/로그인/로그아웃 기능
- **📱 반응형 디자인**: 모바일과 데스크톱에서 모두 사용 가능

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 URL과 API 키를 복사합니다.
3. `src/App.jsx` 파일에서 다음 부분을 수정합니다:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 3. 데이터베이스 테이블 생성

Supabase SQL 편집기에서 다음 SQL을 실행하여 필요한 테이블을 생성합니다:

```sql
-- 사용자 프로필 테이블 (선택사항)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- 일기 엔트리 테이블
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mood_score INTEGER,
  primary_emotion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security) 설정
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책 설정
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 🛠️ 기술 스택

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Login.jsx          # 로그인 컴포넌트
│   ├── Register.jsx       # 회원가입 컴포넌트
│   ├── Dashboard.jsx      # 대시보드 (홈)
│   ├── JournalEntry.jsx   # 일기 작성 페이지
│   ├── Results.jsx        # 결과 페이지
│   └── Navigation.jsx     # 네비게이션
├── App.jsx               # 메인 앱 컴포넌트
├── main.jsx              # 앱 진입점
├── index.css             # 전역 스타일
└── App.css               # 앱 스타일
```

## 🎨 주요 페이지

### 1. 로그인/회원가입
- 깔끔하고 직관적인 인증 인터페이스
- 이메일/비밀번호 기반 회원가입 및 로그인

### 2. 대시보드 (홈)
- 환영 메시지와 통계 카드
- 최근 일기 미리보기
- 빠른 액션 버튼

### 3. 일기 작성
- 텍스트 입력을 통한 일기 작성
- 실시간 감정 분석
- 작성 팁 제공

### 4. 결과 페이지
- 감정 점수 및 이모지 표시
- 일기 내용 확인
- 감정 트렌드 차트
- 음악 추천 시스템
- 통계 요약

## 🔧 커스터마이징

### 감정 분석 로직 수정
`src/components/JournalEntry.jsx`의 `analyzeEmotion` 함수를 수정하여 더 정교한 감정 분석을 구현할 수 있습니다.

### 음악 추천 수정
`src/components/Results.jsx`의 `musicRecommendations` 객체를 수정하여 다른 음악을 추천할 수 있습니다.

### 스타일 수정
`tailwind.config.js`에서 색상 테마를 수정하여 디자인을 변경할 수 있습니다.

## 🚀 배포

### Vercel 배포
1. GitHub에 코드를 푸시합니다.
2. [Vercel](https://vercel.com)에서 새 프로젝트를 생성합니다.
3. 환경 변수에 Supabase URL과 API 키를 설정합니다.
4. 배포를 완료합니다.

### Netlify 배포
1. `npm run build`로 프로덕션 빌드를 생성합니다.
2. [Netlify](https://netlify.com)에서 사이트를 배포합니다.
3. 환경 변수를 설정합니다.

## 🤝 기여하기

1. 이 저장소를 포크합니다.
2. 새로운 기능 브랜치를 생성합니다.
3. 변경사항을 커밋합니다.
4. 브랜치에 푸시합니다.
5. Pull Request를 생성합니다.

## 📄 라이선스

MIT License

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**감정일기**와 함께 당신의 마음을 기록하고, 더 나은 내일을 만들어보세요! 💙 