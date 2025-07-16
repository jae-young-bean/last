import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../App'
import { Send, BookOpen, Loader } from 'lucide-react'

function JournalEntry({ user }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // 간단한 감정 분석 함수 (실제로는 AI API를 사용해야 함)
  const analyzeEmotion = (text) => {
    const positiveWords = ['행복', '기쁨', '좋다', '만족', '감사', '사랑', '즐거움', '희망', '성공', '웃음']
    const negativeWords = ['슬픔', '우울', '화남', '스트레스', '걱정', '불안', '실패', '절망', '고민', '피곤']
    const neutralWords = ['보통', '평범', '일반', '그저', '그냥', '보통']

    const textLower = text.toLowerCase()
    let positiveScore = 0
    let negativeScore = 0
    let neutralScore = 0

    positiveWords.forEach(word => {
      if (textLower.includes(word)) positiveScore += 1
    })

    negativeWords.forEach(word => {
      if (textLower.includes(word)) negativeScore += 1
    })

    neutralWords.forEach(word => {
      if (textLower.includes(word)) neutralScore += 1
    })

    // 감정 점수 계산 (0-100)
    const total = positiveScore + negativeScore + neutralScore
    if (total === 0) return { mood_score: 50, primary_emotion: '중립' }

    const positiveRatio = positiveScore / total
    const negativeRatio = negativeScore / total

    let moodScore = 50 // 기본값
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('일기 내용을 입력해주세요.')
      return
    }

    if (content.length < 10) {
      setError('일기 내용은 최소 10자 이상 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 감정 분석
      const emotionAnalysis = analyzeEmotion(content)

      // Supabase에 저장
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            mood_score: emotionAnalysis.mood_score,
            primary_emotion: emotionAnalysis.primary_emotion,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error

      // 결과 페이지로 이동
      navigate('/results', { 
        state: { 
          entry: data[0],
          analysis: emotionAnalysis
        }
      })

    } catch (error) {
      console.error('Error saving journal entry:', error)
      setError('일기를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">오늘의 일기</h1>
        <p className="text-lg text-gray-600">
          오늘 하루는 어떠셨나요? 자유롭게 기록해보세요.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-3">
              일기 내용
            </label>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="오늘 하루 동안 있었던 일, 느낀 감정, 생각 등을 자유롭게 적어보세요..."
                disabled={loading}
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {content.length} / 1000자
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              최소 10자 이상 입력해주세요. 감정 분석을 통해 당신의 마음을 분석해드립니다.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span>감정 분석이 포함된 결과를 확인할 수 있습니다</span>
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>분석 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>일기 저장</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 도움말 */}
      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 일기 작성 팁</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• 오늘 있었던 특별한 일이나 일상적인 순간을 기록해보세요</li>
          <li>• 그 순간 느낀 감정과 생각을 솔직하게 표현해보세요</li>
          <li>• 감정을 표현하는 단어를 사용하면 더 정확한 분석이 가능합니다</li>
          <li>• 긍정적인 단어: 행복, 기쁨, 만족, 감사, 사랑, 즐거움 등</li>
          <li>• 부정적인 단어: 슬픔, 우울, 화남, 스트레스, 걱정, 불안 등</li>
        </ul>
      </div>
    </div>
  )
}

export default JournalEntry 