import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { QRList } from './components/QRList';
import { QRModal } from './components/QRModal';
import { QRDetailAnalytics } from './components/QRDetailAnalytics';
import { AggregatedAnalytics } from './components/AggregatedAnalytics';
import { PrivacyModal } from './components/PrivacyModal';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

function DashboardContent() {
  const { user, loginAsDemo } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'overview' | 'detail'
  const [selectedQrId, setSelectedQrId] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [qrToEdit, setQrToEdit] = useState(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const fetchQRCodes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getQRCodes();
      setQrCodes(res.qr_codes || []);
    } catch (err) {
      console.error('Failed to fetch QR codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQRCodes();
    }
  }, [user]);

  const handleEdit = (qr) => {
    setQrToEdit(qr);
    setIsCreateOpen(true);
  };

  const handleOpenCreate = () => {
    setQrToEdit(null);
    setIsCreateOpen(true);
  };

  const handleSelectAnalytics = (id) => {
    setSelectedQrId(id);
    setActiveTab('detail');
  };

  const handleToggleActive = async (id) => {
    try {
      await api.toggleQRCode(id);
      fetchQRCodes();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteQRCode(id);
      fetchQRCodes();
    } catch (err) {
      console.error('Failed to delete QR code:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onOpenCreate={handleOpenCreate}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'dashboard') setSelectedQrId(null);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {user ? (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-ink-line">
                  <div>
                    <h1 className="font-display text-2xl font-medium text-paper">I miei codici QR</h1>
                    <p className="text-xs text-paper-faint mt-1">
                      Modifica la destinazione in qualsiasi momento senza ristampare i codici fisici.
                    </p>
                  </div>
                  <button
                    onClick={fetchQRCodes}
                    disabled={loading}
                    className="p-2 border border-ink-line hover:border-signal-cyan/40 text-paper-dim hover:text-paper transition-colors"
                    title="Ricarica elenco"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-signal-cyan' : ''}`} />
                  </button>
                </div>

                <QRList
                  qrCodes={qrCodes}
                  onEdit={handleEdit}
                  onSelectAnalytics={handleSelectAnalytics}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  onOpenCreate={handleOpenCreate}
                />
              </div>
            )}

            {activeTab === 'detail' && selectedQrId && (
              <QRDetailAnalytics
                qrId={selectedQrId}
                onBack={() => {
                  setActiveTab('dashboard');
                  setSelectedQrId(null);
                }}
              />
            )}

            {activeTab === 'overview' && (
              <AggregatedAnalytics
                onSelectQR={(id) => {
                  setSelectedQrId(id);
                  setActiveTab('detail');
                }}
              />
            )}
          </>
        ) : (
          /* Minimal logged-out state — tool, not landing page */
          <div className="py-16 md:py-24 max-w-5xl mx-auto">

            <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end pb-10 border-b border-ink-line">
              <div>
                <span className="font-mono text-xs text-paper-faint tracking-wider">PERMQR / SISTEMA DI REDIRECT</span>
                <h1 className="font-display text-4xl sm:text-5xl font-medium text-paper tracking-tight leading-[1.1] mt-3">
                  Un codice.<br />Destinazione modificabile.
                </h1>
                <p className="text-sm text-paper-dim max-w-md mt-4 leading-relaxed">
                  Genera un QR permanente, cambia l'URL di destinazione quando serve, senza ristampare nulla. Ogni scansione viene registrata in forma anonima.
                </p>
              </div>

              <div className="flex md:flex-col gap-2 w-full md:w-auto">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-signal-cyan hover:bg-signal-cyan/90 text-ink text-sm font-semibold transition-colors"
                >
                  Crea account
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={loginAsDemo}
                  className="flex-1 md:flex-none px-5 py-2.5 border border-ink-line hover:border-signal-cyan/50 text-paper text-sm font-medium transition-colors"
                >
                  Account demo
                </button>
              </div>
            </div>

            {/* Spec strip — factual, not sales copy */}
            <div className="grid grid-cols-1 sm:grid-cols-3">
              <div className="py-6 sm:pr-8 sm:border-r border-ink-line">
                <span className="font-mono text-[11px] text-signal-cyan tracking-wider">01</span>
                <h3 className="text-sm font-medium text-paper mt-2">ID permanente</h3>
                <p className="text-xs text-paper-faint leading-relaxed mt-1.5">
                  Ogni codice ha un identificativo fisso. L'URL finale si modifica dalla dashboard in qualsiasi momento.
                </p>
              </div>

              <div className="py-6 sm:px-8 sm:border-r border-ink-line">
                <span className="font-mono text-[11px] text-signal-cyan tracking-wider">02</span>
                <h3 className="text-sm font-medium text-paper mt-2">Analytics scansioni</h3>
                <p className="text-xs text-paper-faint leading-relaxed mt-1.5">
                  Volume nel tempo, dispositivo, sistema operativo, città e nazione per ogni scansione registrata.
                </p>
              </div>

              <div className="py-6 sm:pl-8">
                <span className="font-mono text-[11px] text-signal-cyan tracking-wider">03</span>
                <h3 className="text-sm font-medium text-paper mt-2">Conforme al GDPR</h3>
                <p className="text-xs text-paper-faint leading-relaxed mt-1.5">
                  IP anonimizzato, nessun cookie di terze parti, geolocalizzazione approssimata a livello di rete.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-ink-line py-5 text-center text-xs text-paper-faint">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div>PermQR Tracker © 2026</div>
          <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-signal-cyan transition-colors">
            Privacy &amp; GDPR
          </button>
        </div>
      </footer>

      {/* Modals */}
      <QRModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        qrToEdit={qrToEdit}
        onSaved={fetchQRCodes}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
