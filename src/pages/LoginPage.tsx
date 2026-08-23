import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLoader } from '../context/LoaderContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { inputStyle, labelStyle, errorTextStyle } from '../lib/glass'
import logo from '../logo.png'

// ---------------------------------------------------------------------------
// Bandeiras (apenas visual — não altera nenhuma lógica de autenticação/i18n
// já existente. Se um dia quiseres ligar a um sistema de idiomas real, basta
// usar o `activeLang` abaixo).
// ---------------------------------------------------------------------------
const FLAGS = [
  { code: 'ao', emoji: '🇦🇴', label: 'Angola' },
  { code: 'br', emoji: '🇧🇷', label: 'Brasil' },
  { code: 'pt', emoji: '🇵🇹', label: 'Portugal' },
  { code: 'us', emoji: '🇺🇸', label: 'English' },
  { code: 'es', emoji: '🇪🇸', label: 'Español' },
]

// ---------------------------------------------------------------------------
// Termos e Condições — mostrados no modal flutuante depois do login.
// O texto da Sinistro X fica embutido; o da Deriv só é linkado (é a Deriv
// quem detém e atualiza o próprio documento legal).
// ---------------------------------------------------------------------------
const TERMOS_SINISTRO = `TERMOS E CONDIÇÕES — SINISTRO X

1. ACEITAÇÃO DOS TERMOS
Ao utilizar a plataforma Sinistro X, o utilizador aceita integralmente os presentes termos e condições.

2. RISCOS
O trading envolve riscos elevados de perda de capital. Os resultados passados não garantem resultados futuros. O utilizador é o único responsável pelas suas decisões de investimento.

3. RESPONSABILIDADE
A Sinistro X não se responsabiliza por perdas financeiras resultantes do uso da plataforma.

4. CONTACTO
Para questões, contacte-nos via WhatsApp.`

const DERIV_TERMS_URL = 'https://deriv.com/tnc/general-terms.pdf'
const TERMS_ACCEPTED_KEY = 'sinistro_terms_accepted_v1'

export default function LoginPage() {
  const navigate = useNavigate()
  const { show, hide } = useLoader() as any // hide pode não existir consoante a versão do contexto
  const { isLocalAuthenticated, isLocalLoading, loginLocal, logout } = useAuth() as any

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLang, setActiveLang] = useState('ao')
  const [showTerms, setShowTerms] = useState(false)

  // Distingue "já estava autenticado ao abrir a página" (ex: refresh)
  // de "acabou de fazer login agora mesmo, aqui, neste formulário".
  // Sem isto, o useEffect abaixo navega sozinho para /connect-deriv
  // assim que loginLocal() atualiza o contexto — antes do modal de
  // termos ter hipótese de aparecer.
  const justLoggedInRef = useRef(false)

  useEffect(() => {
    if (!isLocalLoading && isLocalAuthenticated && !justLoggedInRef.current) {
      navigate('/connect-deriv')
    }
  }, [isLocalLoading, isLocalAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Preenche o email e a senha.')
      return
    }

    setIsSubmitting(true)
    show('A entrar...')
    try {
      const res = await api.loginLocal(email.trim(), password)

      // Marca ANTES de atualizar o contexto de auth, para o useEffect
      // não disparar a navegação automática enquanto decidimos aqui
      // se é preciso mostrar o modal de termos primeiro.
      justLoggedInRef.current = true
      loginLocal(res.token, res.user)

      // Depois de autenticar, mostra o modal de Termos e Condições no
      // centro do ecrã antes de avançar — só passa para a próxima página
      // quando o utilizador confirmar que leu e aceita.
      let alreadyAccepted = false
      try { alreadyAccepted = localStorage.getItem(TERMS_ACCEPTED_KEY) === '1' } catch { /* ignora */ }

      try { hide?.() } catch { /* opcional */ }

      if (alreadyAccepted) {
        navigate('/connect-deriv')
      } else {
        setShowTerms(true)
      }
    } catch (err: any) {
      // Credenciais erradas → 401 do backend. Mostramos a mensagem certa
      // em vez de deixar o loader a girar para sempre.
      const msg = err?.message || 'Não foi possível entrar.'
      if (msg.includes('401') || msg.toLowerCase().includes('inválid') || msg.toLowerCase().includes('incorret')) {
        setError('Email ou senha incorretos.')
      } else {
        setError(msg)
      }
      justLoggedInRef.current = false
      try { hide?.() } catch { /* opcional, LoaderContext pode não ter hide() */ }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = () => {
    alert('Recuperação de senha em breve. Por agora, contacta o suporte via WhatsApp para reativar o acesso.')
  }

  const handleAcceptTerms = () => {
    try { localStorage.setItem(TERMS_ACCEPTED_KEY, '1') } catch { /* ignora */ }
    setShowTerms(false)
    navigate('/connect-deriv')
  }

  const handleDeclineTerms = () => {
    // Sem aceitar os termos não há acesso — termina a sessão local e
    // volta ao ecrã de login.
    setShowTerms(false)
    justLoggedInRef.current = false
    try {
      if (typeof logout === 'function') {
        logout()
      } else {
        localStorage.removeItem('token')
      }
    } catch { /* ignora */ }
    navigate('/login', { replace: true })
  }

  if (isLocalLoading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--blue-hi)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={pageWrapStyle}>
      {/* Fundo preto elegante em vidro (glassmorphism) */}
      <GlassBlackBackground />

      {/* Bandeiras — topo, centradas na horizontal */}
      <div style={flagsRowStyle}>
        {FLAGS.map((f) => (
          <button
            key={f.code}
            type="button"
            title={f.label}
            aria-label={f.label}
            onClick={() => setActiveLang(f.code)}
            style={flagBtnStyle(activeLang === f.code)}
          >
            <span style={{ fontSize: 17, lineHeight: 1 }}>{f.emoji}</span>
          </button>
        ))}
      </div>

      {/* Cartão de login — liso, sem moldura */}
      <div className="card fade-in" style={cardStyle}>
        <div style={{ textAlign: 'center' }}>
          {/* Espaço reservado para o logo em PNG (sem fundo) — troca o src abaixo
              pelo ficheiro do teu logo. O tamanho acompanha o texto "SINISTRO X". */}
          <img
            src={logo}
            alt="Sinistro X"
            style={{ height: 56, width: 'auto', marginBottom: 10, objectFit: 'contain' }}
          />
          {/* Nome da marca: "SINISTRO" a branco, "X" a vermelho — sem gradiente,
              cor sólida para máximo contraste sobre o fundo preto em vidro. */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 0.5,
            fontSize: 30, marginBottom: 4,
          }}>
            <span style={{ color: 'var(--white)' }}>SINISTRO </span>
            <span style={{ color: 'var(--red-hi)', textShadow: '0 0 18px var(--red-glow)' }}>X</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 26 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle} htmlFor="email">Email</label>
            <input
              id="email" type="email" autoComplete="email" style={cleanInputStyle}
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="teu@email.com" disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle} htmlFor="password">Senha</label>
            <input
              id="password" type="password" autoComplete="current-password" style={cleanInputStyle}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" disabled={isSubmitting}
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 22 }}>
            <button type="button" onClick={handleForgotPassword} style={linkBtnStyle}>
              Esqueci a senha
            </button>
          </div>

          {error && <p style={{ ...errorTextStyle, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%' }}>
            {isSubmitting ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '26px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <p style={{ color: 'var(--text-faint)', fontSize: 12 }}>Não tem conta?</p>
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ color: 'var(--blue-hi)', fontSize: 14, fontWeight: 600 }}>
            Criar conta
          </Link>
        </div>

        <div style={{ marginTop: 30, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-faint)', fontSize: 11 }}>© 2026 Sinistro X</p>
        </div>
      </div>

      {/* Modal flutuante, centrado — Termos e Condições da Sinistro X e da
          Deriv, exigido logo após o login antes de continuar */}
      {showTerms && <TermsModal onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal de Termos e Condições — flutua no centro da página
// ---------------------------------------------------------------------------
function TermsModal({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const [tab, setTab] = useState<'sinistro' | 'deriv'>('sinistro')

  return (
    <div className="glass-overlay" style={{ zIndex: 900 }}>
      <div className="glass-sheet" style={{ maxWidth: 460 }}>
        <div className="glass-sheet-header">
          <p style={{ color: 'var(--white)', fontWeight: 700, fontSize: 16 }}>Termos e Condições</p>
        </div>

        {/* Tabs — Sinistro X / Deriv */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={() => setTab('sinistro')}
            style={{
              flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
              color: tab === 'sinistro' ? 'var(--white)' : 'var(--text-faint)',
              borderBottom: tab === 'sinistro' ? '2px solid var(--red-hi)' : '2px solid transparent',
            }}
          >
            SINISTRO X
          </button>
          <button
            onClick={() => setTab('deriv')}
            style={{
              flex: 1, padding: '12px 0', fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
              color: tab === 'deriv' ? 'var(--white)' : 'var(--text-faint)',
              borderBottom: tab === 'deriv' ? '2px solid var(--red-hi)' : '2px solid transparent',
            }}
          >
            DERIV
          </button>
        </div>

        <div className="glass-sheet-body" style={{ maxHeight: 320, padding: 18 }}>
          {tab === 'sinistro' ? (
            <pre style={{ color: 'var(--text-dim)', fontSize: 11.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' }}>
              {TERMOS_SINISTRO}
            </pre>
          ) : (
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: 12.5, lineHeight: 1.7, marginBottom: 14 }}>
                Ao ligar a tua conta Deriv através da Sinistro X, estás também
                sujeito aos termos e condições gerais da Deriv, que regulam a
                abertura de conta, depósitos, levantamentos e a negociação de
                contratos na própria Deriv. A Sinistro X não altera nem
                substitui esses termos.
              </p>
              <a
                href={DERIV_TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: 'var(--red-hi)', fontSize: 13, fontWeight: 600,
                }}
              >
                Ver termos completos da Deriv
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, padding: 16, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={onDecline} className="btn-ghost" style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
            Não aceito
          </button>
          <button onClick={onAccept} className="btn-primary" style={{ flex: 1 }}>
            Li e aceito os termos
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Fundo preto elegante em vidro (glassmorphism) — puramente decorativo.
//
// CORREÇÃO/REDESIGN: versão anterior tinha um gráfico de linha azul/vermelho
// a "flutuar" por cima do fundo, o que competia visualmente com o logo e
// puxava para a paleta antiga (Lucro IA). Substituído por um fundo preto
// profundo com camadas de vidro (glass) sobrepostas — brilhos radiais muito
// subtis a vermelho (cor da marca) e um véu de vidro com leve textura de
// ruído, sem elementos figurativos a competir com o cartão de login.
// ---------------------------------------------------------------------------
function GlassBlackBackground() {
  return (
    <>
      <style>{`
        @keyframes sinistro-glow {
          0%   { opacity: 0.5; transform: scale(1); }
          50%  { opacity: 0.85; transform: scale(1.06); }
          100% { opacity: 0.5; transform: scale(1); }
        }
        @keyframes sinistro-sheen {
          0%   { opacity: 0.3; }
          50%  { opacity: 0.55; }
          100% { opacity: 0.3; }
        }
      `}</style>

      {/* base — preto profundo, quase absoluto */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(circle at 50% -10%, #0c0c0e 0%, #050506 55%, #000000 100%)',
        zIndex: 0,
      }} />

      {/* brilho vermelho subtil, no eixo do "X" da marca — topo */}
      <div style={{
        position: 'fixed', top: '-18%', left: '50%', transform: 'translateX(-50%)',
        width: 560, height: 560, borderRadius: '50%', zIndex: 0,
        background: 'radial-gradient(circle, rgba(233,32,63,0.16) 0%, transparent 68%)',
        filter: 'blur(10px)',
        animation: 'sinistro-glow 9s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* brilho azul-roxo bem discreto, canto inferior — profundidade sem competir com o vermelho */}
      <div style={{
        position: 'fixed', bottom: '-15%', right: '-10%',
        width: 480, height: 480, borderRadius: '50%', zIndex: 0,
        background: 'radial-gradient(circle, rgba(88,98,191,0.10) 0%, transparent 70%)',
        filter: 'blur(10px)',
        pointerEvents: 'none',
      }} />

      {/* véu de vidro por cima de tudo — dá o efeito "vidro limpo" sobre o preto */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(0.5px)',
        animation: 'sinistro-sheen 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* vinheta — escurece levemente os cantos, foca o olhar no cartão central */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'radial-gradient(circle at 50% 45%, transparent 40%, rgba(0,0,0,0.45) 100%)',
        pointerEvents: 'none',
      }} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const pageWrapStyle: React.CSSProperties = {
  position: 'relative', minHeight: '100dvh',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16, overflow: 'hidden',
  background: '#000',
}

const flagsRowStyle: React.CSSProperties = {
  position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', gap: 10, zIndex: 20,
}

const flagBtnStyle = (active: boolean): React.CSSProperties => ({
  width: 34, height: 34, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  border: 'none',
  cursor: 'pointer', transition: 'all 0.2s ease',
  boxShadow: active ? '0 0 0 3px rgba(233,32,63,0.18)' : 'none',
})

const cardStyle: React.CSSProperties = {
  position: 'relative', zIndex: 10,
  width: '100%', maxWidth: 400,
  padding: '48px 36px 36px',
  borderRadius: 28,
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 24px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
  background: 'rgba(255,255,255,0.035)',
  backdropFilter: 'blur(32px) saturate(150%)',
  WebkitBackdropFilter: 'blur(32px) saturate(150%)',
}

const cleanInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 0,
  padding: '10px 2px',
}

const linkBtnStyle: React.CSSProperties = {
  color: 'var(--text-faint)', fontSize: 12.5,
  background: 'none', border: 'none', cursor: 'pointer',
}
