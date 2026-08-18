import React from 'react';
import { PRIDE_CONIC } from '../prideTheme';

/**
 * PrideAvatar — Mike/Adam rendered as an initial (or their photo) inside a
 * pride conic-gradient ring. Replaces the plain colored text we used to lean
 * on to tell the two of us apart.
 *
 * Props:
 *   person   'mike' | 'adam' | any string (first letter is used)
 *   size     px diameter of the whole badge (ring included). Default 28.
 *   photo    optional image URL
 *   muted    dim the ring (e.g. hasn't checked in / hasn't logged the run)
 *   ring     false = skip the gradient ring entirely
 */
const FACE = {
  mike: { bg: 'rgba(56,132,255,0.22)', fg: '#93c5fd' },
  adam: { bg: 'rgba(168,85,247,0.22)', fg: '#d8b4fe' },
};

export const PrideAvatar = ({ person, size = 28, photo, muted = false, ring = true, title, className = '' }) => {
  const key = String(person || '').toLowerCase();
  const face = FACE[key] || { bg: 'rgba(255,255,255,0.12)', fg: 'rgba(255,255,255,0.75)' };
  const pad = size >= 40 ? 3 : 2;
  const inner = size - pad * 2;
  return (
    <span
      title={title || (person ? String(person) : undefined)}
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        padding: pad,
        background: ring ? PRIDE_CONIC : 'transparent',
        opacity: muted ? 0.45 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <span
        className="inline-flex items-center justify-center rounded-full overflow-hidden"
        style={{
          width: inner,
          height: inner,
          background: '#0f172a',
          boxShadow: `inset 0 0 0 ${Math.max(1, Math.round(inner / 14))}px ${face.bg}`,
        }}
      >
        {photo ? (
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span
            style={{
              color: face.fg,
              fontSize: Math.max(9, Math.round(inner * 0.5)),
              fontWeight: 700,
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {key.charAt(0) || '?'}
          </span>
        )}
      </span>
    </span>
  );
};

/**
 * PrideNameChip — avatar + name, the standard way to say "this is Mike" or
 * "this is Adam" anywhere in the app.
 */
export const PrideNameChip = ({ person, size = 22, photo, muted, suffix, className = '' }) => {
  const key = String(person || '').toLowerCase();
  const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <PrideAvatar person={person} size={size} photo={photo} muted={muted} />
      <span className="font-semibold">{label}</span>
      {suffix}
    </span>
  );
};

export default PrideAvatar;
