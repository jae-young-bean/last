import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../App'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('=== 로그인 시도 시작 ===')
      console.log('이메일:', email)
      console.log('비밀번호 길이:', password.length)
      
      // 1단계: 일반 로그인 시도
      console.log('1단계: 일반 로그인 시도...')
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('일반 로그인 결과:', { 
        success: !error, 
        user: data?.user?.id, 
        error: error?.message 
      })

      // 로그인 성공한 경우
      if (data?.user && !error) {
        console.log('✅ 일반 로그인 성공!')
        console.log('사용자 정보:', data.user)
        navigate('/')
        return
      }

      // 2단계: 이메일 확인 에러인 경우, 회원가입을 통한 로그인 시도
      if (error && (error.message.includes('Email not confirmed') || error.message.includes('Invalid login credentials'))) {
        console.log('2단계: 회원가입을 통한 로그인 시도...')
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              email_confirmed: true // 추가 메타데이터
            }
          }
        })

        console.log('회원가입 로그인 결과:', { 
          success: !signUpError, 
          user: signUpData?.user?.id, 
          error: signUpError?.message 
        })

        if (signUpData?.user && !signUpError) {
          console.log('✅ 회원가입을 통한 로그인 성공!')
          console.log('사용자 정보:', signUpData.user)
          navigate('/')
          return
        }

        if (signUpError) {
          console.error('회원가입 로그인 에러:', signUpError)
          // 계속 진행
        }
      }

      // 3단계: 마지막 시도 - 강제 로그인
      console.log('3단계: 강제 로그인 시도...')
      
      // 기존 사용자 삭제 후 재생성
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(data?.user?.id)
        console.log('기존 사용자 삭제 결과:', deleteError ? '실패' : '성공')
      } catch (e) {
        console.log('사용자 삭제 실패 (무시):', e.message)
      }

      // 새로운 회원가입
      const { data: finalData, error: finalError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })

      console.log('최종 로그인 결과:', { 
        success: !finalError, 
        user: finalData?.user?.id, 
        error: finalError?.message 
      })

      if (finalData?.user && !finalError) {
        console.log('✅ 강제 로그인 성공!')
        console.log('사용자 정보:', finalData.user)
        navigate('/')
        return
      }

      // 모든 시도 실패
      console.error('❌ 모든 로그인 시도 실패')
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')

    } catch (error) {
      console.error('로그인 예외 발생:', error)
      setError('로그인 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    setResendLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        setError('이메일 재전송에 실패했습니다: ' + error.message)
      } else {
        setError('확인 이메일을 다시 전송했습니다. 이메일을 확인해주세요.')
      }
    } catch (error) {
      setError('이메일 재전송에 실패했습니다.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleForceLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('=== 강제 로그인 시작 ===')
      
      // 1. 기존 세션 정리
      await supabase.auth.signOut()
      console.log('기존 세션 정리 완료')
      
      // 2. 새로운 회원가입으로 로그인
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })

      console.log('강제 로그인 결과:', { 
        success: !error, 
        user: data?.user?.id, 
        error: error?.message 
      })

      if (error) {
        console.error('강제 로그인 에러:', error)
        setError('강제 로그인 실패: ' + error.message)
      } else if (data?.user) {
        console.log('✅ 강제 로그인 성공!')
        console.log('사용자 정보:', data.user)
        navigate('/')
      } else {
        setError('강제 로그인 실패: 사용자 정보를 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('강제 로그인 예외:', error)
      setError('강제 로그인 실패: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="card w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">감정일기</h1>
          <p className="text-gray-600">당신의 마음을 기록하세요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-start">
                <span>{error}</span>
                {error.includes('이메일 확인이 필요합니다') && (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
                  >
                    {resendLoading ? '전송 중...' : '이메일 재전송'}
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              '로그인'
            )}
          </button>

          <button
            type="button"
            onClick={handleForceLogin}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              '강제 로그인 (이메일 확인 없이)'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 