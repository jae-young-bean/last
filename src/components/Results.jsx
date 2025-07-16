import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { supabase } from '../App'
import { BarChart3, Music, Heart, TrendingUp, Calendar, ArrowLeft } from 'lucide-react'

function Results({ user }) {
  const location = useLocation()
  const [currentEntry, setCurrentEntry] = useState(location.state?.entry)
  const [analysis, setAnalysis] = useState(location.state?.analysis)
  const [allEntries, setAllEntries] = useState([])
  const [loading, setLoading] = useState(!currentEntry)

  // 음악 추천 데이터
  const musicRecommendations = {
    happy: [
      { title: 'Happy', artist: 'Pharrell Williams', genre: 'Pop' },
      { title: 'Good Life', artist: 'OneRepublic', genre: 'Pop Rock' },
      { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', genre: 'Pop' }
    ],
    sad: [
      { title: 'Fix You', artist: 'Coldplay', genre: 'Alternative Rock' },
      { title: 'Someone Like You', artist: 'Adele', genre: 'Pop' },
      { title: 'All of Me', artist: 'John Legend', genre: 'R&B' }
    ],
    calm: [
      { title: 'Weightless', artist: 'Marconi Union', genre: 'Ambient' },
      { title: 'Claire de Lune', artist: 'Debussy', genre: 'Classical' },
      { title: 'River Flows in You', artist: 'Yiruma', genre: 'Piano' }
    ],
    excited: [
      { title: 'Can\'t Stop the Feeling!', artist: 'Justin Timberlake', genre: 'Pop' },
      { title: 'Shake It Off', artist: 'Taylor Swift', genre: 'Pop' },
      { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', genre: 'Funk' }
    ],
    anxious: [
      { title: 'Breathe Me', artist: 'Sia', genre: 'Pop' },
      { title: 'Mad World', artist: 'Gary Jules', genre: 'Alternative' },
      { title: 'The Scientist', artist: 'Coldplay', genre: 'Alternative Rock' }
    ]
  }

  useEffect(() => {
    if (!currentEntry) {
      fetchLatestEntry()
    }
    fetchAllEntries()
  }, [user])

  const fetchLatestEntry = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        setCurrentEntry(data[0])
        // 간단한 감정 분석 (실제로는 저장된 데이터 사용)
        const emotionAnalysis = analyzeEmotion(data[0].content)
        setAnalysis(emotionAnalysis)
      }
    } catch (error) {
      console.error('Error fetching latest entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllEntries(data || [])
    } catch (error) {
      console.error('Error fetching all entries:', error)
    }
  }

  // 감정 분석 함수 (JournalEntry와 동일)
  const analyzeEmotion = (text) => {
    const positiveWords = ['행복', '기쁨', '좋다', '만족', '감사', '사랑', '즐거움', '희망', '성공', '웃음']
    const negativeWords = ['슬픔', '우울', '화남', '스트레스', '걱정', '불안', '실패', '절망', '고민', '피곤']
    
    const textLower = text.toLowerCase()
    let positiveScore = 0
    let negativeScore = 0

    positiveWords.forEach(word => {
      if (textLower.includes(word)) positiveScore += 1
    })

    negativeWords.forEach(word => {
      if (textLower.includes(word)) negativeScore += 1
    })

    const total = positiveScore + negativeScore
    if (total === 0) return { mood_score: 50, primary_emotion: '중립' }

    const positiveRatio = positiveScore / total
    const negativeRatio = negativeScore / total

    let moodScore = 50
    let primaryEmotion = '중립'

    if (positiveRatio > negativeRatio) {
      moodScore = 50 + (positiveRatio * 50)
      primaryEmotion = '긍정'
    } else if (negativeRatio > positiveRatio) {
      moodScore = 50 - (negativeRatio * 50)
      primaryEmotion = '부정'
    }

    return {
      mood_score: Math.round(moodScore),
      primary_emotion: primaryEmotion
    }
  }

  const getMoodEmoji = (score) => {
    if (score >= 80) return '😊'
    if (score >= 60) return '🙂'
    if (score >= 40) return '😐'
    if (score >= 20) return '😔'
    return '😢'
  }

  const getMoodColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    if (score >= 20) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getRecommendedMusic = (emotion) => {
    if (emotion === '긍정') return musicRecommendations.happy
    if (emotion === '부정') return musicRecommendations.sad
    return musicRecommendations.calm
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!currentEntry) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">일기가 없습니다</h2>
        <p className="text-gray-600 mb-6">첫 번째 일기를 작성해보세요!</p>
        <Link to="/journal" className="btn-primary">
          일기 작성하기
        </Link>
      </div>
    )
  }

  const recommendedMusic = getRecommendedMusic(analysis?.primary_emotion)

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">감정 분석 결과</h1>
          <p className="text-gray-600">
            {new Date(currentEntry.created_at).toLocaleDateString('ko-KR')} 작성된 일기
          </p>
        </div>
        <Link to="/journal" className="btn-secondary flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>새 일기 작성</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 감정 분석 결과 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 감정 점수 */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">감정 점수</h2>
            </div>
            
            <div className="text-center">
              <div className="text-6xl mb-4">{getMoodEmoji(analysis?.mood_score)}</div>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-lg font-semibold ${getMoodColor(analysis?.mood_score)}`}>
                <span>{analysis?.mood_score}점</span>
                <span>{analysis?.primary_emotion}</span>
              </div>
            </div>
          </div>

          {/* 일기 내용 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일기 내용</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {currentEntry.content}
              </p>
            </div>
          </div>

          {/* 감정 트렌드 */}
          {allEntries.length > 1 && (
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">감정 트렌드</h3>
              </div>
              
              <div className="space-y-3">
                {allEntries.slice(0, 7).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getMoodEmoji(entry.mood_score)}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(entry.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{entry.mood_score}점</span>
                      <span className="text-sm text-gray-600 ml-2">{entry.primary_emotion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 음악 추천 */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">음악 추천</h3>
            </div>
            
            <div className="space-y-4">
              {recommendedMusic.map((song, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{song.title}</div>
                  <div className="text-sm text-gray-600">{song.artist}</div>
                  <div className="text-xs text-gray-500">{song.genre}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 통계 요약 */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">통계</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">총 일기 수</span>
                <span className="font-medium">{allEntries.length}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">평균 점수</span>
                <span className="font-medium">
                  {allEntries.length > 0 
                    ? Math.round(allEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / allEntries.length)
                    : 0}점
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이번 주</span>
                <span className="font-medium">
                  {allEntries.filter(entry => {
                    const oneWeekAgo = new Date()
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                    return new Date(entry.created_at) > oneWeekAgo
                  }).length}개
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results 