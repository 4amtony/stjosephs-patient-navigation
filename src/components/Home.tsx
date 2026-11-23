import { DEST_BY_ID } from '../data/destinations';
import { useI18n } from '../i18n/I18nProvider';
import { useSession } from '../state/session';
import { Book, Car, ChevronNext, Person, Pin, Qr } from './Icons';

export function Home() {
  const { t } = useI18n();
  const { s, dispatch } = useSession();
  const dest = s.destId ? DEST_BY_ID[s.destId] : null;
  return (
    <div className="screen stack" id="main">
      <h1>{t('home.headline')}</h1>
      {dest && s.originCp && s.originConfirmed && (
        <button className="btn primary block" onClick={() => dispatch({ type: 'go', screen: 'navigate' })}>
          {t('home.resume', { dest: dest.name })} <ChevronNext />
        </button>
      )}
      <button className="card choice hero-choice" onClick={() => dispatch({ type: 'go', screen: dest ? 'plan' : 'search', returnTo: 'plan' })}>
        <span className="icon-bubble"><Car /></span>
        <span>
          <h2>{t('home.planTitle')}</h2>
          <span className="muted">{t('home.planBody')}</span>
        </span>
      </button>
      <button className="card choice hero-choice" onClick={() => dispatch({ type: 'go', screen: 'here', returnTo: 'navigate' })}>
        <span className="icon-bubble"><Pin /></span>
        <span>
          <h2>{t('home.hereTitle')}</h2>
          <span className="muted">{t('home.hereBody')}</span>
          <span className="tiny muted" style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
            <Qr size={14} /> {t('home.scanDemo')}
          </span>
        </span>
      </button>
      <button className="card choice hero-choice" onClick={() => dispatch({ type: 'go', screen: 'help' })}>
        <span className="icon-bubble" style={{ background: '#fff2d6', color: '#7a4a00' }}><Person /></span>
        <span>
          <h2>{t('home.helpTitle')}</h2>
          <span className="muted">{t('home.helpBody')}</span>
        </span>
      </button>
      <p className="small muted">{t('home.noPhone')}</p>
      <button className="btn ghost" style={{ alignSelf: 'flex-start' }} onClick={() => dispatch({ type: 'go', screen: 'sources' })}>
        <Book size={18} /> {t('home.sources')}
      </button>
    </div>
  );
}
