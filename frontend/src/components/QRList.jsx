import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode, ExternalLink, Copy, Check, BarChart2, Edit3, Trash2, Power, Search, Download, Sparkles, Eye
} from 'lucide-react';

// Sub-component to render the live QR Code image on each card
const QRCardThumbnail = ({ redirectUrl, fgColor, bgColor, logoUrl, onDownload }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(redirectUrl, {
          width: 240,
          margin: 1.5,
          color: {
            dark: fgColor || '#0f172a',
            light: bgColor || '#ffffff'
          },
          errorCorrectionLevel: 'H'
        });

        if (!isMounted) return;

        if (logoUrl) {
          // Overlay logo on image
          const canvas = document.createElement('canvas');
          canvas.width = 240;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          const qrImg = new Image();
          qrImg.src = url;

          await new Promise((resolve) => {
            qrImg.onload = () => {
              ctx.drawImage(qrImg, 0, 0);
              const logoImg = new Image();
              logoImg.crossOrigin = 'anonymous';
              logoImg.src = logoUrl;
              logoImg.onload = () => {
                const logoSize = Math.floor(240 * 0.22);
                const x = Math.floor((240 - logoSize) / 2);
                const y = Math.floor((240 - logoSize) / 2);
                ctx.fillStyle = bgColor || '#ffffff';
                ctx.beginPath();
                ctx.roundRect(x - 3, y - 3, logoSize + 6, logoSize + 6, 6);
                ctx.fill();
                ctx.drawImage(logoImg, x, y, logoSize, logoSize);
                setDataUrl(canvas.toDataURL('image/png'));
                resolve();
              };
              logoImg.onerror = () => {
                setDataUrl(url);
                resolve();
              };
            };
          });
        } else {
          setDataUrl(url);
        }
      } catch (err) {
        console.error('Thumbnail error:', err);
      }
    };

    generateQR();
    return () => { isMounted = false; };
  }, [redirectUrl, fgColor, bgColor, logoUrl]);

  return (
    <div className="relative group/qr flex flex-col items-center justify-center p-3 rounded-xl bg-white shadow-md border border-ink-line/30">
      {dataUrl ? (
        <img src={dataUrl} alt="QR Code" className="w-28 h-28 object-contain rounded" />
      ) : (
        <div className="w-28 h-28 bg-paper/10 flex items-center justify-center text-paper-dim">
          <QrCode className="w-8 h-8 animate-pulse" />
        </div>
      )}

      {/* Quick Download Hover Button */}
      <button
        onClick={onDownload}
        title="Scarica subito in Alta Risoluzione PNG"
        className="absolute inset-0 bg-ink/75 opacity-0 group-hover/qr:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1 text-paper font-bold text-xs p-2 backdrop-blur-xs"
      >
        <Download className="w-6 h-6 text-signal-cyan" />
        <span>Scarica PNG</span>
      </button>
    </div>
  );
};

export const QRList = ({ qrCodes, onEdit, onSelectAnalytics, onToggleActive, onDelete, onOpenCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredQRs = qrCodes.filter((qr) => {
    const term = searchTerm.toLowerCase();
    return (
      qr.title.toLowerCase().includes(term) ||
      qr.destination_url.toLowerCase().includes(term) ||
      qr.short_id.toLowerCase().includes(term)
    );
  });

  const handleCopyLink = (shortId, id) => {
    const url = `${window.location.origin}/r/${shortId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDirectDownloadPNG = async (qr) => {
    const redirectUrl = `${window.location.origin}/r/${qr.short_id}`;
    try {
      const canvas = document.createElement('canvas');
      const size = 1024;
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, redirectUrl, {
        width: size,
        margin: 2,
        color: {
          dark: qr.fg_color || '#0f172a',
          light: qr.bg_color || '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      if (qr.logo_url) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = qr.logo_url;

        await new Promise((resolve) => {
          img.onload = () => {
            const logoSize = Math.floor(size * 0.22);
            const x = Math.floor((size - logoSize) / 2);
            const y = Math.floor((size - logoSize) / 2);
            ctx.fillStyle = qr.bg_color || '#ffffff';
            ctx.beginPath();
            ctx.roundRect(x - 8, y - 8, logoSize + 16, logoSize + 16, 20);
            ctx.fill();
            ctx.drawImage(img, x, y, logoSize, logoSize);
            resolve();
          };
          img.onerror = () => resolve();
        });
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_${qr.title.replace(/\s+/g, '_')}_${qr.short_id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (qrCodes.length === 0) {
    return (
      <div className="border border-dashed border-ink-line p-14 text-center max-w-lg mx-auto my-12">
        <div className="w-12 h-12 border border-signal-cyan/30 text-signal-cyan flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-5 h-5" />
        </div>
        <h3 className="font-display text-lg font-medium text-paper mb-2">Nessun codice creato</h3>
        <p className="text-paper-faint text-sm mb-6 leading-relaxed">
          Crea il tuo primo codice QR permanente. Potrai tracciare le scansioni in tempo reale e cambiare la destinazione quando vuoi.
        </p>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-cyan hover:bg-signal-cyan/90 text-ink text-sm font-semibold transition-colors"
        >
          Crea il primo QR
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-paper-faint absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cerca per titolo, URL o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 field-input text-xs text-paper placeholder-paper-faint"
          />
        </div>
        <div className="text-xs text-paper-faint font-mono self-end sm:self-auto">
          {filteredQRs.length} / {qrCodes.length}
        </div>
      </div>

      {/* Responsive Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQRs.map((qr) => {
          const redirectUrl = `${window.location.origin}/r/${qr.short_id}`;
          const isCopied = copiedId === qr.id;

          return (
            <div
              key={qr.id}
              className={`bg-ink-soft p-5 border transition-colors flex flex-col justify-between ${
                qr.is_active ? 'border-ink-line hover:border-signal-cyan/40' : 'border-signal-magenta/25 bg-signal-magenta/5 opacity-80'
              }`}
            >
              <div>
                {/* Status Badge & Active Switch */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        qr.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-signal-magenta/10 text-signal-magenta border border-signal-magenta/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${qr.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-signal-magenta'}`} />
                      {qr.is_active ? 'Attivo' : 'Disattivato'}
                    </span>
                    <span className="text-[10px] font-mono text-paper-faint">ID {qr.short_id}</span>
                  </div>

                  <button
                    onClick={() => onToggleActive(qr.id)}
                    title={qr.is_active ? 'Disattiva QR' : 'Attiva QR'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      qr.is_active
                        ? 'bg-ink-raised text-emerald-400 border-ink-line hover:bg-ink-line'
                        : 'bg-signal-magenta/15 text-signal-magenta border-signal-magenta/40 hover:bg-signal-magenta/25'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* QR Code Visual & Header Section */}
                <div className="flex items-start gap-4 mb-4">
                  <QRCardThumbnail
                    redirectUrl={redirectUrl}
                    fgColor={qr.fg_color}
                    bgColor={qr.bg_color}
                    logoUrl={qr.logo_url}
                    onDownload={() => handleDirectDownloadPNG(qr)}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-base font-medium text-paper mb-2 line-clamp-2">{qr.title}</h4>
                    
                    {/* Fast Action Download Button */}
                    <button
                      onClick={() => handleDirectDownloadPNG(qr)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-signal-cyan/10 hover:bg-signal-cyan/15 border border-signal-cyan/40 text-signal-cyan font-semibold text-xs transition-colors mb-2"
                    >
                      <Download className="w-3.5 h-3.5 text-signal-cyan" />
                      Scarica QR PNG
                    </button>
                  </div>
                </div>

                {/* Destination Link */}
                <div className="mb-4">
                  <span className="text-[11px] uppercase tracking-wider text-paper-faint font-semibold block mb-1">Destinazione Finale:</span>
                  <a
                    href={qr.destination_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-signal-cyan hover:underline flex items-center gap-1 line-clamp-1 break-all"
                  >
                    {qr.destination_url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {/* Scan Metrics Counter */}
                <div className="p-3 rounded-xl bg-ink-soft border border-ink-line flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-paper-dim uppercase font-semibold block">Scansioni Totali</span>
                    <span className="text-lg font-bold text-paper">{qr.total_scans || 0}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-paper-dim uppercase font-semibold block">Ultima Scansione</span>
                    <span className="text-xs text-paper-dim">
                      {qr.last_scanned_at ? new Date(qr.last_scanned_at).toLocaleDateString('it-IT') : 'Mai'}
                    </span>
                  </div>
                </div>

                {/* Redirect Permanent Link Box */}
                <div className="p-2.5 rounded-xl bg-ink/80 border border-ink-line flex items-center justify-between gap-2 mb-4">
                  <div className="truncate text-xs font-mono text-paper-dim">{redirectUrl}</div>
                  <button
                    onClick={() => handleCopyLink(qr.short_id, qr.id)}
                    className="p-1.5 rounded-lg bg-ink-raised hover:bg-ink-line text-paper-dim hover:text-paper transition-colors shrink-0"
                    title="Copia link permanente"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-ink-line grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSelectAnalytics(qr.id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-signal-cyan/10 border border-signal-cyan/30 text-signal-cyan hover:bg-signal-cyan/15 font-semibold text-xs transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Stats
                </button>

                <button
                  onClick={() => onEdit(qr)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ink-raised hover:bg-ink-line text-paper border border-ink-line font-semibold text-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Modifica
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Eliminare il codice QR "${qr.title}"? Tutte le statistiche verranno rimosse.`)) {
                      onDelete(qr.id);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-signal-magenta/10 border border-signal-magenta/30 text-signal-magenta hover:bg-signal-magenta/15 font-semibold text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Elimina
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
