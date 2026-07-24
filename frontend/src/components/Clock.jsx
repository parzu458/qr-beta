import React, { useState, useEffect } from 'react';

// Minimal live clock — reinforces the "system status" tech register of the
// interface without needing any imagery. Updates once a second.
export const Clock = ({ className = '' }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).toUpperCase();

  return (
    <span className={`font-mono tabular ${className}`}>
      <span className="text-paper-dim">{date}</span>
      <span className="text-paper-faint mx-1.5">·</span>
      <span className="text-paper">{time}</span>
    </span>
  );
};
