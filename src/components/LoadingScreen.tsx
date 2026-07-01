import React from 'react'

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-50">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #4F8EC4 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #4DB4EA 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative mb-8 animate-fade-in">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #4F8EC4 0%, #5FA0D4 60%, #4DB4EA 100%)',
            boxShadow: '0 0 40px rgba(79, 142, 196, 0.4)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 6L32 13V27L20 34L8 27V13L20 6Z"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinejoin="round"
            />
            <path
              d="M20 14L26 17.5V24.5L20 28L14 24.5V17.5L20 14Z"
              fill="white"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* Rotating ring */}
        <div
          className="absolute -inset-2 rounded-3xl border-2 border-transparent"
          style={{
            borderTopColor: '#4F8EC4',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            animation: 'spin 1.5s linear infinite',
          }}
        />
      </div>

      {/* App name */}
      <h1 className="text-2xl font-bold text-text-primary tracking-widest mb-2 animate-fade-in">
        CRYPTO<span className="text-accent-purple">MIR</span>
      </h1>
      <p className="text-text-secondary text-sm animate-fade-in">Загрузка...</p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent-purple"
            style={{
              animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen
