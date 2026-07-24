import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Palette, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

const PRESET_COLORS = [
  { fg: '#0f172a', bg: '#ffffff', label: 'Classic' },
  { fg: '#0284c7', bg: '#f0f9ff', label: 'Ocean' },
  { fg: '#059669', bg: '#ecfdf5', label: 'Emerald' },
  { fg: '#7c3aed', bg: '#f5f3ff', label: 'Violet' },
  { fg: '#e11d48', bg: '#fff1f2', label: 'Rose' },
  { fg: '#ffffff', bg: '#0f172a', label: 'Dark Mode' }
];

export const QRCustomizer = ({
  redirectUrl,
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  logoUrl,
  setLogoUrl
}) => {
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    generateCanvas();
  }, [redirectUrl, fgColor, bgColor, logoUrl]);

  const generateCanvas = async (targetSize = 320) => {
    const canvas = canvasRef.current;
    if (!canvas || !redirectUrl) return;

    try {
      // 1. Draw QR code on Canvas
      await QRCode.toCanvas(canvas, redirectUrl, {
        width: targetSize,
        margin: 2,
        color: {
          dark: fgColor || '#0f172a',
          light: bgColor || '#ffffff'
        },
        errorCorrectionLevel: 'H' // High error correction to support center logo overlay!
      });

      // 2. Draw Center Logo Overlay if present
      if (logoUrl) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoUrl;

        await new Promise((resolve) => {
          img.onload = () => {
            const logoSize = Math.floor(targetSize * 0.22);
            const x = Math.floor((targetSize - logoSize) / 2);
            const y = Math.floor((targetSize - logoSize) / 2);

            // White rounded backing box for logo legibility
            ctx.fillStyle = bgColor || '#ffffff';
            ctx.beginPath();
            const radius = 8;
            ctx.roundRect(x - 4, y - 4, logoSize + 8, logoSize + 8, radius);
            ctx.fill();

            // Draw image inside
            ctx.drawImage(img, x, y, logoSize, logoSize);
            resolve();
          };
          img.onerror = () => resolve();
        });
      }
    } catch (err) {
      console.error('QR Render Error:', err);
    }
  };

  const handleDownloadPNG = async (size = 1024) => {
    setDownloading(true);
    try {
      const highResCanvas = document.createElement('canvas');
      highResCanvas.width = size;
      highResCanvas.height = size;

      await QRCode.toCanvas(highResCanvas, redirectUrl, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor || '#0f172a',
          light: bgColor || '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      if (logoUrl) {
        const ctx = highResCanvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoUrl;

        await new Promise((resolve) => {
          img.onload = () => {
            const logoSize = Math.floor(size * 0.22);
            const x = Math.floor((size - logoSize) / 2);
            const y = Math.floor((size - logoSize) / 2);

            ctx.fillStyle = bgColor || '#ffffff';
            ctx.beginPath();
            ctx.roundRect(x - 8, y - 8, logoSize + 16, logoSize + 16, 20);
            ctx.fill();
            ctx.drawImage(img, x, y, logoSize, logoSize);
            resolve();
          };
          img.onerror = () => resolve();
        });
      }

      const dataUrl = highResCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_Code_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download Error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(redirectUrl, {
        type: 'svg',
        color: {
          dark: fgColor || '#0f172a',
          light: bgColor || '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `QR_Code_${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG Download Error:', err);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setLogoUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Live QR Preview */}
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-ink-soft border border-ink-line shadow-inner">
        <div className="relative p-4 rounded-2xl shadow-xl transition-all" style={{ backgroundColor: bgColor }}>
          <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
        </div>
        <p className="text-xs text-paper-dim mt-3 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-signal-cyan" /> Anteprima in tempo reale
        </p>
      </div>

      {/* Preset Palettes */}
      <div>
        <label className="block text-xs font-medium text-paper-dim mb-2 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-signal-cyan" /> Tavolozze Colori Predefinite
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESET_COLORS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFgColor(preset.fg);
                setBgColor(preset.bg);
              }}
              className="flex flex-col items-center gap-1 p-2 rounded-xl border border-ink-line hover:border-signal-cyan/50 bg-ink-soft transition-all text-xs text-paper-dim"
            >
              <div className="w-8 h-8 rounded-lg border border-ink-line flex items-center justify-center shadow-inner" style={{ backgroundColor: preset.bg }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.fg }}></div>
              </div>
              <span className="text-[10px] font-medium">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Hex Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-paper-dim mb-1.5">Colore QR (Foreground)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg field-input text-xs text-paper uppercase font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-paper-dim mb-1.5">Colore Sfondo (Background)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg field-input text-xs text-paper uppercase font-mono"
            />
          </div>
        </div>
      </div>

      {/* Logo Customizer */}
      <div>
        <label className="block text-xs font-medium text-paper-dim mb-1.5 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-signal-cyan" /> Logo al Centro (Opzionale)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload-input"
          />
          <label
            htmlFor="logo-upload-input"
            className="px-4 py-2 rounded-xl bg-ink-raised hover:bg-ink-line text-paper text-xs font-medium cursor-pointer transition-colors border border-ink-line"
          >
            Scegli Immagine...
          </label>
          {logoUrl && (
            <button
              type="button"
              onClick={() => setLogoUrl(null)}
              className="text-xs text-signal-magenta hover:underline font-medium"
            >
              Rimuovi logo
            </button>
          )}
        </div>
      </div>

      {/* Export & Download Buttons */}
      <div className="pt-4 border-t border-ink-line grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleDownloadPNG(2048)}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-signal-cyan hover:bg-signal-cyan/85 text-ink font-bold text-xs transition-colors shadow-lg shadow-signal-cyan/15"
        >
          <Download className="w-4 h-4" />
          Scaric a PNG Alta Risoluzione (2K)
        </button>

        <button
          type="button"
          onClick={handleDownloadSVG}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ink-raised hover:bg-ink-line text-paper font-semibold text-xs transition-colors border border-ink-line"
        >
          <Download className="w-4 h-4 text-signal-cyan" />
          Scarica Vettoriale SVG
        </button>
      </div>

    </div>
  );
};
