import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { QRCustomizer } from './QRCustomizer';
import { X, Globe, Type, Palette, Save, Sparkles, ShieldCheck } from 'lucide-react';

export const QRModal = ({ isOpen, onClose, qrToEdit, onSaved }) => {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'customizer'
  const [title, setTitle] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrToEdit) {
      setTitle(qrToEdit.title || '');
      setDestinationUrl(qrToEdit.destination_url || '');
      setFgColor(qrToEdit.fg_color || '#0f172a');
      setBgColor(qrToEdit.bg_color || '#ffffff');
      setLogoUrl(qrToEdit.logo_url || null);
    } else {
      setTitle('');
      setDestinationUrl('');
      setFgColor('#0f172a');
      setBgColor('#ffffff');
      setLogoUrl(null);
    }
    setError('');
    setActiveTab('general');
  }, [qrToEdit, isOpen]);

  if (!isOpen) return null;

  const redirectPreviewUrl = qrToEdit
    ? `${window.location.origin}/r/${qrToEdit.short_id}`
    : `${window.location.origin}/r/preview`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !destinationUrl.trim()) {
      setError('Inserisci un titolo e un URL di destinazione valido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (qrToEdit) {
        await api.updateQRCode(qrToEdit.id, {
          title,
          destination_url: destinationUrl,
          fg_color: fgColor,
          bg_color: bgColor,
          logo_url: logoUrl
        });
      } else {
        await api.createQRCode({
          title,
          destination_url: destinationUrl,
          fg_color: fgColor,
          bg_color: bgColor,
          logo_url: logoUrl
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Operazione fallita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl surface-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-ink-line max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-paper-dim hover:text-paper p-1 rounded-lg hover:bg-ink-raised"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-paper">
            {qrToEdit ? 'Modifica QR Code' : 'Crea Nuovo Codice QR Permanente'}
          </h2>
          <p className="text-xs text-paper-dim mt-1">
            Il codice fisico generato resterà permanente. Potrai cambiare l'URL finale in qualsiasi momento.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mb-6 p-1 rounded-xl bg-ink-soft border border-ink-line">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'general'
                ? 'bg-signal-cyan/15 text-signal-cyan border border-signal-cyan/40'
                : 'text-paper-dim hover:text-paper'
            }`}
          >
            <Globe className="w-4 h-4" />
            1. Destinazione & Titolo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customizer')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'customizer'
                ? 'bg-signal-cyan/15 text-signal-cyan border border-signal-cyan/40'
                : 'text-paper-dim hover:text-paper'
            }`}
          >
            <Palette className="w-4 h-4" />
            2. Aspetto & Export
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-signal-magenta/10 border border-signal-magenta/30 text-signal-magenta text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === 'general' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-paper-dim mb-1.5 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-signal-cyan" /> Titolo Identificativo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Menu Ristorante Estate 2026, Volantino Promozionale..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl field-input text-sm text-paper placeholder-paper-faint"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-paper-dim mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-signal-cyan" /> URL di Destinazione Finale
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://mio-sito.it/offerte"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl field-input text-sm text-paper placeholder-paper-faint"
                />
                <p className="text-[11px] text-paper-dim mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Puoi modificare questo link in futuro senza dover ristampare il codice QR!
                </p>
              </div>

              {qrToEdit && (
                <div className="p-3 rounded-xl bg-ink-soft border border-ink-line text-xs text-paper-dim">
                  <span className="font-semibold text-paper-dim">Link Permanente Redirezione:</span>
                  <div className="mt-1 font-mono text-signal-cyan select-all font-semibold">
                    {redirectPreviewUrl}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <QRCustomizer
              redirectUrl={redirectPreviewUrl}
              fgColor={fgColor}
              setFgColor={setFgColor}
              bgColor={bgColor}
              setBgColor={setBgColor}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
            />
          )}

          <div className="mt-6 pt-4 border-t border-ink-line flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-paper-dim hover:text-paper text-xs font-medium"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-signal-cyan hover:bg-signal-cyan/90 text-ink font-semibold text-xs shadow-lg shadow-signal-cyan/20 transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvataggio...' : qrToEdit ? 'Aggiorna Codice QR' : 'Crea e Salva QR Code'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
