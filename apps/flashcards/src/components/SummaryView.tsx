import { useI18n } from '../i18n';

interface SummaryViewProps {
  known: number;
  unknown: number;
  canStudyAgain: boolean;
  onStudyAgain: () => void;
  onBack: () => void;
}

export default function SummaryView({ known, unknown, canStudyAgain, onStudyAgain, onBack }: SummaryViewProps) {
  const t = useI18n();
  return (
    <section className="summary">
      <h1 className="summary-title tilt-l">{t.summary.title}</h1>
      <div className="summary-stats">
        <div className="summary-stat summary-stat-known tilt-l">
          <span className="summary-num">{known}</span>
          <span className="summary-label">{t.summary.knewIt}</span>
        </div>
        <div className="summary-stat summary-stat-unknown tilt-r">
          <span className="summary-num">{unknown}</span>
          <span className="summary-label">{t.summary.review}</span>
        </div>
      </div>
      <div className="summary-actions">
        {canStudyAgain && (
          <button className="btn btn-big btn-primary tilt-l" onClick={onStudyAgain}>
            {t.summary.studyAgain}
          </button>
        )}
        <button className="btn btn-ghost" onClick={onBack}>
          {t.summary.backToDeck}
        </button>
      </div>
    </section>
  );
}
