import { useState } from 'react'
import { supabase } from '../lib/supabase'

type LoginProps = {
  onLogin: (user: any) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRegister, setShowRegister] = useState(false)
const [confirmPassword, setConfirmPassword] = useState('')
const [success, setSuccess] = useState('')

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    const { data } = await supabase.auth.getUser()

onLogin(data.user)
  }

    async function handleRegister(event: React.FormEvent) {
    event.preventDefault()

    setLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(
      'Cadastro realizado! Verifique seu e-mail para confirmar sua conta.'
    )

    setPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

    return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">
          Estoque da Gráfica
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {showRegister
            ? 'Crie sua conta para começar.'
            : 'Entre na sua conta para continuar.'}
        </p>

        <form
          onSubmit={showRegister ? handleRegister : handleLogin}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Sua senha"
              required
            />
          </div>

          {showRegister && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Confirmar senha
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="Digite a senha novamente"
                required
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading
              ? showRegister
                ? 'Criando conta...'
                : 'Entrando...'
              : showRegister
                ? 'Criar conta'
                : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setShowRegister(!showRegister)
              setError('')
              setSuccess('')
            }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            {showRegister
              ? 'Já tenho uma conta'
              : 'Ainda não tenho uma conta'}
          </button>
        </div>
      </div>
    </div>
  )
}