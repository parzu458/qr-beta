import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
  ArrowLeft, RefreshCw, Smartphone, Monitor, Globe, MapPin, Eye, Calendar, ShieldCheck, Cpu
} from 'lucide-react';

const DEVICE_COLORS = {
  mobile: '#0284c7',
  desktop: '#38bdf8',
  tablet: '#7c3aed'
};

const CHART_PALETTE = ['#0284c7', '#38bdf8', '#059669', '#7c3aed', '#f59e0b', '#e11d48', '#06b6d4'];

export const QRDetailAnalytics = ({ qrId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getQRAnalytics(qrId);
      setData(res);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento delle statistiche');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [qrId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-paper-dim gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-signal-cyan" />
        <span className="text-sm font-medium">Caricamento statistiche in corso...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="surface-card rounded-2xl p-8 text-center max-w-md mx-auto my-12 border border-signal-magenta/30">
        <p className="text-signal-magenta text-sm mb-4">{error || 'Impossibile accedere alle statistiche'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-ink-raised text-paper text-xs font-semibold hover:bg-ink-line"
        >
          Torna alla Lista
        </button>
      </div>
    );
  }

  const { qr_code, total_scans, time_series, devices, os_breakdown, browsers, countries, cities, recent_scans } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-line">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-ink-raised hover:bg-ink-line text-paper-dim transition-colors border border-ink-line"
            title="Torna alla Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-paper">{qr_code.title}</h2>
            <p className="text-xs text-paper-dim mt-0.5">
              Destinazione: <a href={qr_code.destination_url} target="_blank" rel="noreferrer" className="text-signal-cyan hover:underline">{qr_code.destination_url}</a>
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-raised hover:bg-ink-line text-paper-dim text-xs font-semibold transition-colors border border-ink-line self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-signal-cyan" />
          Aggiorna Dati
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="surface-card p-5 rounded-2xl border border-ink-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-paper-dim">Scansioni Totali</span>
            <Eye className="w-5 h-5 text-signal-cyan" />
          </div>
          <div className="text-3xl font-extrabold text-paper">{total_scans}</div>
          <p className="text-[11px] text-paper-faint mt-1">Registrate dal giorno di creazione</p>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-ink-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-paper-dim">Dispositivo Top</span>
            <Smartphone className="w-5 h-5 text-signal-cyan" />
          </div>
          <div className="text-2xl font-bold text-paper capitalize">
            {devices.length > 0 ? devices[0].device_type : 'N/D'}
          </div>
          <p className="text-[11px] text-paper-faint mt-1">
            {devices.length > 0 ? `${devices[0].count} scansioni` : 'Nessun dato'}
          </p>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-ink-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-paper-dim">Paese Principale</span>
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-paper">
            {countries.length > 0 ? countries[0].country : 'N/D'}
          </div>
          <p className="text-[11px] text-paper-faint mt-1">
            {countries.length > 0 ? `${countries[0].count} scansioni` : 'Nessun dato'}
          </p>
        </div>

        <div className="surface-card p-5 rounded-2xl border border-ink-line">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-paper-dim">Città Principale</span>
            <MapPin className="w-5 h-5 text-signal-yellow" />
          </div>
          <div className="text-2xl font-bold text-paper">
            {cities.length > 0 ? cities[0].city : 'N/D'}
          </div>
          <p className="text-[11px] text-paper-faint mt-1">
            {cities.length > 0 ? `${cities[0].count} scansioni` : 'Nessun dato'}
          </p>
        </div>

      </div>

      {/* Scans Over Time Chart */}
      <div className="surface-card p-6 rounded-2xl border border-ink-line">
        <h3 className="text-base font-bold text-paper mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-signal-cyan" />
          Andamento Scansioni nel Tempo
        </h3>
        {time_series.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={time_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="count" name="Scansioni" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#scanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-paper-faint text-xs">
            Nessuna scansione registrata nel periodo selezionato.
          </div>
        )}
      </div>

      {/* Breakdowns Grid (Devices, OS, Browsers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Device Breakdown */}
        <div className="surface-card p-6 rounded-2xl border border-ink-line">
          <h3 className="text-sm font-bold text-paper mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-signal-cyan" /> Dispositivi
          </h3>
          {devices.length > 0 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    dataKey="count"
                    nameKey="device_type"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {devices.map((entry, idx) => (
                      <Cell key={idx} fill={DEVICE_COLORS[entry.device_type] || CHART_PALETTE[idx % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend formatter={(val) => <span className="text-xs text-paper-dim capitalize">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-paper-faint text-center py-12">Nessun dato</p>
          )}
        </div>

        {/* Operating Systems Breakdown */}
        <div className="surface-card p-6 rounded-2xl border border-ink-line">
          <h3 className="text-sm font-bold text-paper mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" /> Sistemi Operativi
          </h3>
          {os_breakdown.length > 0 ? (
            <div className="space-y-3">
              {os_breakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-paper-dim font-medium">{item.os_name}</span>
                    <span className="text-paper-dim">{item.count} scansioni</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ink-raised overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${Math.min(100, (item.count / total_scans) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-paper-faint text-center py-12">Nessun dato</p>
          )}
        </div>

        {/* Browsers Breakdown */}
        <div className="surface-card p-6 rounded-2xl border border-ink-line">
          <h3 className="text-sm font-bold text-paper mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-signal-yellow" /> Browser
          </h3>
          {browsers.length > 0 ? (
            <div className="space-y-3">
              {browsers.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-paper-dim font-medium">{item.browser_name}</span>
                    <span className="text-paper-dim">{item.count} scansioni</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ink-raised overflow-hidden">
                    <div
                      className="h-full rounded-full bg-signal-yellow"
                      style={{ width: `${Math.min(100, (item.count / total_scans) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-paper-faint text-center py-12">Nessun dato</p>
          )}
        </div>

      </div>

      {/* Recent Scans Stream */}
      <div className="surface-card rounded-2xl p-6 border border-ink-line">
        <h3 className="text-base font-bold text-paper mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-signal-cyan" />
          Registro Ultime Scansioni (IP Anonimizzato GDPR)
        </h3>
        {recent_scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-paper-dim">
              <thead className="bg-ink-soft text-paper-dim uppercase text-[10px] font-semibold tracking-wider border-b border-ink-line">
                <tr>
                  <th className="py-3 px-4">Data e Ora</th>
                  <th className="py-3 px-4">IP (Anonimizzato)</th>
                  <th className="py-3 px-4">Località</th>
                  <th className="py-3 px-4">Dispositivo / OS</th>
                  <th className="py-3 px-4">Browser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-line">
                {recent_scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-ink-raised/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-paper-dim">
                      {new Date(scan.scanned_at).toLocaleString('it-IT')}
                    </td>
                    <td className="py-3 px-4 font-mono text-signal-cyan">
                      {scan.anonymized_ip}
                    </td>
                    <td className="py-3 px-4 font-medium text-paper">
                      {scan.city}, {scan.country}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {scan.device_type} ({scan.os_name})
                    </td>
                    <td className="py-3 px-4 text-paper-dim">
                      {scan.browser_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-paper-faint text-center py-8">Ancora nessuna scansione registrata.</p>
        )}
      </div>

    </div>
  );
};
