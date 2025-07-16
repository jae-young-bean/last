import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../App'
import { BookOpen, TrendingUp, Music, Heart, Calendar, Plus } from 'lucide-react'

function Dashboard({ user }) {
  const [recentEntries, setRecentEntries] = useState([])
  const [stats, setStats] = useState({
    totalEntries: 0,
    thisWeek: 0,
    averageMood: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // 최근 일기 가져오기
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      setRecentEntries(entries || [])

      // 통계 계산
      const { data: allEntries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)

      const totalEntries = allEntries?.length || 0
      
      // 이번 주 일기 수 계산
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const thisWeekEntries = allEntries?.filter(entry => 
        new Date(entry.created_at) > oneWeekAgo
      ) || []

      // 평균 감정 점수 계산
      const totalMood = allEntries?.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) || 0
      const averageMood = totalEntries > 0 ? Math.round(totalMood / totalEntries) : 0

      setStats({
        totalEntries,
        thisWeek: thisWeekEntries.length,
        averageMood
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoodEmoji = (score) => {
    if (score >= 80) return '😊'
    if (score >= 60) return '🙂'
    if (score >= 40) return '😐'
    if (score >= 20) return '😔'
    return '😢'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 fade-in">
      {/* 환영 메시지 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          안녕하세요, {user?.user_metadata?.name || '사용자'}님! 👋
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          오늘 하루는 어떠셨나요? 당신의 마음을 기록해보세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">총 일기 수</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">이번 주</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">평균 감정</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">{stats.averageMood}</span>
                <span className="text-xl">{getMoodEmoji(stats.averageMood)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">빠른 시작</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/journal"
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">새 일기 작성</h3>
              <p className="text-sm text-gray-600">오늘의 감정을 기록해보세요</p>
            </div>
          </Link>

          <Link
            to="/results"
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">결과 보기</h3>
              <p className="text-sm text-gray-600">감정 분석 결과를 확인하세요</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 최근 일기 */}
      {recentEntries.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">최근 일기</h2>
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getMoodEmoji(entry.mood_score)}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.content?.substring(0, 50)}...
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(entry.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{entry.mood_score}점</p>
                  <p className="text-sm text-gray-600">{entry.primary_emotion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 음악 추천 */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">오늘의 음악 추천</h2>
        </div>
        <p className="text-gray-600 mb-4">
          감정 분석을 통해 당신에게 맞는 음악을 추천해드립니다.
        </p>
        <Link
          to="/results"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <span>음악 추천 받기</span>
          <TrendingUp className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default Dashboard 