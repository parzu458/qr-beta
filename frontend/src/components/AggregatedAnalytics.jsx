import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { BarChart2, RefreshCw, Eye, QrCode, TrendingUp, Smartphone, Award, ExternalLink } from 'lucide-react';

export const AggregatedAnalytics = ({ onSelectQR }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAggregatedOverview();
      setData(res);
    } catch (err) {
      setError(err.message || 'Impossibile caricare le analitiche aggregate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-paper-dim gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-signal-cyan" />
        <span className="text-sm font-medium">Elaborazione quadro analitico globale...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center max-w-md mx-auto my-12 border border-signal-magenta/30">
        <p className="text-signal-magenta text-sm mb-4">{error || 'Errore nel recupero dati'}</p>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 rounded-xl bg-ink-raised text-paper text-xs font-semibold hover:bg-ink-line"
        >
          Riprova
        </button>
      </div>
    );
  }

  const { total_qrs, active_qrs, inactive_qrs, total_scans, scans_today, top_qrs, time_series, devices } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-line">
        <div>
          <h2 className="text-2xl font-bold text-paper flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-signal-cyan" />
            Panoramica Analytics Aggregata
          </h2>
          <p className="text-xs text-paper-dim mt-1">
            Analisi comparativa delle performance su tutti i tuoi codici QR attivi
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-raised hover:bg-ink-line text-paper-dim text-xs font-semibold transition-colors border border-ink-line"
        >
          <RefreshCw className="w-4 h-4 text-signal-cyan" />
          Aggiorna
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="surface-card p-5 rounded-2xl border border-ink-line">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-paper-dim block mb-1">Totale Codici QR</span>
          <div className="text-3xl font-extrabold text-paper">{total_qrs}</div>
          <div className="text-[11px] text-paper-faint mt-1 flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">{active_qrs} Attivi</span> • <span>{inactive_qrs} Disattivi</span>
          </div>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-ink-line">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-paper-dim block mb-1">Scansioni Totali</span>
          <div className="text-3xl font-extrabold text-signal-cyan">{total_scans}</div>
          <p className="text-[11px] text-paper-faint mt-1">Cumulate su tutti i codici</p>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-ink-line">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-paper-dim block mb-1">Scansioni Oggi</span>
          <div className="text-3xl font-extrabold text-emerald-400">{scans_today}</div>
          <p className="text-[11px] text-paper-faint mt-1">Ultime 24 ore</p>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-ink-line col-span-1 sm:col-span-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-paper-dim block mb-1">Top Performer</span>
          <div className="text-lg font-bold text-paper truncate">
            {top_qrs.length > 0 ? top_qrs[0].title : 'Nessun QR'}
          </div>
          <p className="text-[11px] text-signal-cyan font-medium mt-1">
            {top_qrs.length > 0 ? `${top_qrs[0].scan_count} scansioni totali` : '0 scansioni'}
          </p>
        </div>

      </div>

      {/* Aggregated Time Trend Chart */}
      <div className="surface-card p-6 rounded-2xl border border-ink-line">
        <h3 className="text-base font-bold text-paper mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-signal-cyan" />
          Volume Scansioni Complessivo nel Tempo
        </h3>
        {time_series.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={time_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="globalScanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="count" name="Scansioni Globali" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#globalScanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-paper-faint text-xs">
            Nessun dato di scansione aggregato disponibile al momento.
          </div>
        )}
      </div>

      {/* Top QR Codes Ranking Table */}
      <div className="surface-card p-6 rounded-2xl border border-ink-line">
        <h3 className="text-base font-bold text-paper mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-signal-yellow" />
          Classifica Performance Codici QR
        </h3>
        {top_qrs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-paper-dim">
              <thead className="bg-ink-soft text-paper-dim uppercase text-[10px] font-semibold tracking-wider border-b border-ink-line">
                <tr>
                  <th className="py-3 px-4">Posizione</th>
                  <th className="py-3 px-4">Titolo QR Code</th>
                  <th className="py-3 px-4">ID Permanente</th>
                  <th className="py-3 px-4">Stato</th>
                  <th className="py-3 px-4 text-right">Scansioni Totali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-line">
                {top_qrs.map((qr, idx) => (
                  <tr
                    key={qr.id}
                    onClick={() => onSelectQR(qr.id)}
                    className="hover:bg-ink-raised cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-signal-cyan">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-paper">
                      {qr.title}
                    </td>
                    <td className="py-3 px-4 font-mono text-paper-dim">
                      {qr.short_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${qr.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-signal-magenta/10 text-signal-magenta'}`}>
                        {qr.is_active ? 'Attivo' : 'Disattivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-paper text-sm">
                      {qr.scan_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-paper-faint text-center py-8">Nessun codice QR presente.</p>
        )}
      </div>

    </div>
  );
};
