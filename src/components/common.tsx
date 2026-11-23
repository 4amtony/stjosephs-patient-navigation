import { useEffect, type ReactNode } from 'react';
import { useI18n, SignChip } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/core';
import type { Provenance } from '../data/types';
import { Close, Info, Warn, Check } from './Icons';

export function Prov({ status, withHelp = false }: { status: Provenance; withHelp?: boolean }) {
  const { t } = useI18n();
  return (
    <span className={`prov ${status}`} title={t(`prov.help.${status}` as MessageKey)}>
      {t(`prov.${status}` as MessageKey)}
      {withHelp && <span className="sr-only"> — {t(`prov.help.${status}` as MessageKey)}</span>}
    </span>
  );
}

export function Callout({ tone = 'info', children, icon = true }: { tone?: 'info' | 'good' | 'warn' | 'bad'; children: ReactNode; icon?: boolean }) {
  const I = tone === 'good' ? Check : tone === 'info' ? Info : Warn;
  return (
    <div className={`callout ${tone}`} role={tone === 'bad' || tone === 'warn' ? 'alert' : undefined}>
      {icon && <I size={20} />}
      <div>{children}</div>
    </div>
  );
}

export function Sheet({ title, onClose, children, labelledBy }: { title: ReactNode; onClose: () => void; children: ReactNode; labelledBy?: string }) {
  const { t } = useI18n();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const id = labelledBy ?? 'sheet-title';
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={id} onClick={(e) => e.stopPropagation()}>
        <div className="grabber" />
        <div className="sheet-head">
          <h2 id={id} style={{ margin: 0 }}>{title}</h2>
          <button className="btn ghost small" onClick={onClose} aria-label={t('nav.close')}>
            <Close size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ label, help, checked, onChange, icon }: { label: string; help?: string; checked: boolean; onChange: (v: boolean) => void; icon?: ReactNode }) {
  return (
    <div className="toggle" onClick={() => onChange(!checked)}>
      {icon}
      <span className="tl">
        {label}
        {help && <small>{help}</small>}
      </span>
      <button
        type="button"
        role="switch"
        className="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
      />
    </div>
  );
}

export function Code({ children }: { children: string }) {
  return <bdi className="code" lang="en" dir="ltr">{children}</bdi>;
}

export { SignChip };

/** Render a message whose params may contain sign chips / nested messages (keeps word order per language). */
export function RichT({ k, p }: { k: MessageKey; p?: import('../engine/routeText').Sentence['p'] }) {
  const { rich } = useI18n();
  return <>{rich({ k, p })}</>;
}

/** Human label for a level; the Cheapside garage is underground but is not the tunnel. */
export function useLevelText() {
  const { t } = useI18n();
  return (level: number, zone?: string) => {
    if (level === -1) return zone === 'CG' ? t('here.groupGarages') : t('level.tunnel');
    if (zone === 'GG') return t('here.groupGarages');
    return t('level.n', { level });
  };
}
