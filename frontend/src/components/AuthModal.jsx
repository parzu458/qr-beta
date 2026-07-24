import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Sparkles, ArrowRight } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, loginAsDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Autenticazione fallita');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo();
      onClose();
    } catch (err) {
      setError('Errore accesso demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-md">
      <div className="relative w-full max-w-md surface-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-ink-line">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-paper-dim hover:text-paper p-1 rounded-lg hover:bg-ink-raised"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-signal-cyan/10 border border-signal-cyan/30 text-signal-cyan mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-paper">
            {isRegister ? 'Crea il tuo Account' : 'Accedi a PermQR'}
          </h2>
          <p className="text-sm text-paper-dim mt-1">
            Gestisci i tuoi codici QR permanenti e consulta le analitiche in tempo reale
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-signal-magenta/10 border border-signal-magenta/30 text-signal-magenta text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-paper-dim mb-1.5">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-paper-faint absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Mario Rossi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl field-input text-sm text-paper placeholder-paper-faint"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-paper-dim mb-1.5">Indirizzo Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-paper-faint absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="nome@azienda.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl field-input text-sm text-paper placeholder-paper-faint"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-paper-dim mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-paper-faint absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl field-input text-sm text-paper placeholder-paper-faint"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-signal-cyan hover:bg-signal-cyan/90 text-ink font-semibold text-sm shadow-lg shadow-signal-cyan/20 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Elaborazione...' : isRegister ? 'Registrati Ora' : 'Accedi'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px bg-ink-raised flex-1"></div>
          <span className="text-xs text-paper-faint uppercase font-semibold">oppure</span>
          <div className="h-px bg-ink-raised flex-1"></div>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-ink-raised hover:bg-ink-line border border-ink-line text-paper text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-signal-yellow" />
          Accedi Subito con Account Demo (1-Click)
        </button>

        <div className="mt-6 text-center text-xs text-paper-dim">
          {isRegister ? (
            <>
              Hai già un account?{' '}
              <button onClick={() => setIsRegister(false)} className="text-signal-cyan font-semibold hover:underline">
                Accedi qui
              </button>
            </>
          ) : (
            <>
              Non hai ancora un account?{' '}
              <button onClick={() => setIsRegister(true)} className="text-signal-cyan font-semibold hover:underline">
                Registrati gratis
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
