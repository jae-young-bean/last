import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import JournalEntry from './components/JournalEntry'
import Results from './components/Results'
import Navigation from './components/Navigation'
import './App.css'

// Supabase 클라이언트 설정
const supabaseUrl = 'https://scojfbyhvlwlbnwwutke.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjb2pmYnlodmx3bGJud3d1dGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjA5MTQsImV4cCI6MjA2ODEzNjkxNH0.Q5riV53eC0Z1SONMBKi0BpJcs5aVQJxTDZZI8ZlG1GU'
export const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    console.log('=== App 컴포넌트 마운트 ===')
    
    // 현재 세션 확인
    const getSession = async () => {
      try {
        console.log('세션 확인 중...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('세션 확인 에러:', error)
        } else {
          console.log('현재 세션:', session ? '있음' : '없음')
          if (session?.user) {
            console.log('사용자 정보:', {
              id: session.user.id,
              email: session.user.email,
              email_confirmed: session.user.email_confirmed_at
            })
          }
        }
        
        setUser(session?.user ?? null)
        setSessionChecked(true)
        setLoading(false)
      } catch (error) {
        console.error('세션 확인 예외:', error)
        setUser(null)
        setSessionChecked(true)
        setLoading(false)
      }
    }

    getSession()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('=== 인증 상태 변경 ===')
        console.log('이벤트:', event)
        console.log('세션:', session ? '있음' : '없음')
        
        if (session?.user) {
          console.log('새로운 사용자 정보:', {
            id: session.user.id,
            email: session.user.email,
            email_confirmed: session.user.email_confirmed_at
          })
        }
        
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      console.log('App 컴포넌트 언마운트 - 구독 해제')
      subscription.unsubscribe()
    }
  }, [])

  // 로딩 중일 때
  if (loading || !sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  console.log('=== App 렌더링 ===')
  console.log('사용자 상태:', user ? '로그인됨' : '로그인 안됨')
  console.log('로딩 상태:', loading)
  console.log('세션 확인 완료:', sessionChecked)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user ? (
          <>
            <Navigation user={user} />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/journal" element={<JournalEntry user={user} />} />
                <Route path="/results" element={<Results user={user} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  )
}

export default App 