import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, CheckCircle2 } from 'lucide-react';

export const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl surface-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-ink-line max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-paper-dim hover:text-paper p-1 rounded-lg hover:bg-ink-raised"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-signal-cyan/10 border border-signal-cyan/30 text-signal-cyan">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-paper">Informativa Privacy e Conformità GDPR</h2>
            <p className="text-xs text-signal-cyan font-medium">Tracciamento Trasparente, Etico e Sicuro</p>
          </div>
        </div>

        <div className="space-y-4 text-paper-dim text-sm leading-relaxed">
          
          <div className="p-4 rounded-xl bg-ink-soft border border-ink-line flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-paper text-base">Anonimizzazione Indirizzo IP</h3>
              <p className="text-paper-dim text-xs mt-1">
                In ottemperanza al GDPR (Regolamento UE 2016/679), gli indirizzi IP dei dispositivi che scansionano i codici QR <strong>vengono istantaneamente troncati ed anonimizzati</strong> (es. <code>192.168.1.xxx</code> o prefisso IPv6). L'IP reale completo non viene mai memorizzato sui nostri database.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ink-soft border border-ink-line flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-paper text-base">Assenza di Cookie di Terze Parti</h3>
              <p className="text-paper-dim text-xs mt-1">
                La fase di reindirizzamento dinamico è completamente <strong>cookie-free</strong>. Nessun cookie di profilazione, retargeting o tracciamento invasivo viene salvato sul browser dell'utente finale che effettua la scansione del QR code fisico.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ink-soft border border-ink-line flex items-start gap-3">
            <Server className="w-5 h-5 text-signal-cyan shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-paper text-base">Geolocalizzazione Approssimativa</h3>
              <p className="text-paper-dim text-xs mt-1">
                La posizione geografica registrata durante ogni scansione (città e paese) viene calcolata in maniera puramente approssimativa a livello di rete IP pubblico. Nessun permesso GPS o tracciamento di posizione preciso viene mai richiesto al dispositivo.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-ink-line">
            <h4 className="font-semibold text-paper mb-2 text-xs uppercase tracking-wider">Dati Raccolti durante ogni Scansione:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-paper-dim">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Timestamp preciso della scansione
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> IP Troncato/Anonimizzato
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tipo Dispositivo (Mobile/Desktop/Tablet)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sistema Operativo & Browser
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Città e Nazione indicativa
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Referrer (se disponibile)
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-signal-cyan hover:bg-signal-cyan/85 text-ink font-bold text-xs transition-colors"
          >
            Ho Capito
          </button>
        </div>

      </div>
    </div>
  );
};
