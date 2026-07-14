import type { AppData, DayStats, Settings, StatsLog } from '../types';
import { MAX_LEVEL, todayISO } from '../leitner';
import { fmt, useI18n } from '../i18n';

interface DashboardProps {
  data: AppData;
  stats: StatsLog;
  settings: Settings;
  onChangeSettings: (patch: Partial<Settings>) => void;
}

/* ---------- pure date/stat helpers ---------- */

function shiftDate(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + deltaDays * 86_400_000).toISOString().slice(0, 10);
}

/** Monday of the week containing `iso` (local weeks start on Monday). */
function mondayOf(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // 0 = Monday
  return shiftDate(iso, -weekday);
}

type Range = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'overall';
const RANGES: Range[] = ['today', 'thisWeek', 'thisMonth', 'thisYear', 'overall'];

function inRange(date: string, range: Range, today: string): boolean {
  switch (range) {
    case 'today':
      return date === today;
    case 'thisWeek':
      return date >= mondayOf(today) && date <= today;
    case 'thisMonth':
      return date.slice(0, 7) === today.slice(0, 7);
    case 'thisYear':
      return date.slice(0, 4) === today.slice(0, 4);
    case 'overall':
      return true;
  }
}

function sumRange(stats: StatsLog, range: Range, today: string, pick: (d: DayStats) => number): number {
  let sum = 0;
  for (const [date, day] of Object.entries(stats.days)) {
    if (inRange(date, range, today)) sum += pick(day);
  }
  return sum;
}

/** Consecutive study days ending today (or yesterday, if today hasn't been studied yet). */
function streakDays(stats: StatsLog, today: string): number {
  const studied = (d: string) => (stats.days[d]?.reviews ?? 0) > 0;
  let day = studied(today) ? today : shiftDate(today, -1);
  let streak = 0;
  while (studied(day)) {
    streak++;
    day = shiftDate(day, -1);
  }
  return streak;
}

/* ---------- component ---------- */

export default function Dashboard({ data, stats, settings, onChangeSettings }: DashboardProps) {
  const t = useI18n();
  const today = todayISO();
  const mode = settings.dashboardMode;
  const widgets = settings.dashboardWidgets;

  const allCards = data.decks.flatMap((d) => d.cards);
  const learned = allCards.filter((c) => c.level >= 1).length;
  const totalReviews = sumRange(stats, 'overall', today, (d) => d.reviews);
  const totalKnown = sumRange(stats, 'overall', today, (d) => d.known);
  const accuracyPct = (known: number, reviews: number) =>
    reviews === 0 ? '—' : `${Math.round((known / reviews) * 100)}%`;
  const streak = streakDays(stats, today);
  const hasAnyStats = totalReviews > 0;

  const rangeLabel: Record<Range, string> = {
    today: t.dashboard.today,
    thisWeek: t.dashboard.thisWeek,
    thisMonth: t.dashboard.thisMonth,
    thisYear: t.dashboard.thisYear,
    overall: t.dashboard.overall,
  };

  // Last 7 days ending today, for the basic week row.
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = shiftDate(today, i - 6);
    const [y, m, d] = date.split('-').map(Number);
    const weekdayIdx = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
    return { date, label: t.dashboard.weekdays[weekdayIdx], filled: (stats.days[date]?.reviews ?? 0) > 0 };
  });

  // Last 30 days for the activity chart.
  const activityDays = Array.from({ length: 30 }, (_, i) => {
    const date = shiftDate(today, i - 29);
    return { date, reviews: stats.days[date]?.reviews ?? 0 };
  });
  const maxActivity = Math.max(1, ...activityDays.map((d) => d.reviews));

  const levelCounts = Array.from({ length: MAX_LEVEL + 1 }, (_, lv) => allCards.filter((c) => c.level === lv).length);
  const maxLevelCount = Math.max(1, ...levelCounts);

  return (
    <section className="dashboard">
      <div className="dashboard-head">
        <h1 className="screen-title tilt-l">{t.dashboard.title}</h1>
        <div className="pill-row">
          {(['basic', 'detail'] as const).map((m) => (
            <button
              key={m}
              className={`pill${mode === m ? ' pill-active' : ''}`}
              onClick={() => onChangeSettings({ dashboardMode: m })}
            >
              {m === 'basic' ? t.dashboard.basic : t.dashboard.detail}
            </button>
          ))}
        </div>
      </div>

      {!hasAnyStats && <p className="empty-text dashboard-empty tilt-l">{t.dashboard.noData}</p>}

      <div className="dash-basic">
        <div className="streak-hero tilt-l">
          <span className="streak-num">{streak}</span>
          <span className="streak-label">{t.dashboard.dayStreak}</span>
        </div>
        <div className="week-row">
          {week.map((day) => (
            <span key={day.date} className={`week-day${day.filled ? ' filled' : ''}`}>
              {day.label}
            </span>
          ))}
        </div>
        <div className="dash-tiles">
          <div className="dash-tile">
            <span className="dash-tile-num num-cyan">{learned}</span>
            <span className="dash-tile-label">{t.dashboard.cardsLearned}</span>
          </div>
          <div className="dash-tile">
            <span className="dash-tile-num num-yellow">{accuracyPct(totalKnown, totalReviews)}</span>
            <span className="dash-tile-label">{t.dashboard.accuracy}</span>
          </div>
        </div>
      </div>

      {mode === 'detail' && (
        <div className="dash-detail">
          {widgets.levelsGained && (
            <div className="widget">
              <h3 className="widget-title">{t.dashboard.levelsGained}</h3>
              <div className="range-tiles">
                {RANGES.map((r) => (
                  <div key={r} className="range-tile">
                    <span className="range-num num-green">{sumRange(stats, r, today, (d) => d.levelsGained)}</span>
                    <span className="range-label">{rangeLabel[r]}</span>
                  </div>
                ))}
              </div>
              <p className="widget-foot">
                {sumRange(stats, 'overall', today, (d) => d.levelsLost)} {t.dashboard.levelsLost}
              </p>
            </div>
          )}

          {widgets.reviews && (
            <div className="widget">
              <h3 className="widget-title">{t.dashboard.reviews}</h3>
              <div className="range-tiles">
                {RANGES.map((r) => (
                  <div key={r} className="range-tile">
                    <span className="range-num num-cyan">{sumRange(stats, r, today, (d) => d.reviews)}</span>
                    <span className="range-label">{rangeLabel[r]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {widgets.accuracy && (
            <div className="widget">
              <h3 className="widget-title">{t.dashboard.accuracy}</h3>
              <div className="range-tiles">
                {RANGES.map((r) => (
                  <div key={r} className="range-tile">
                    <span className="range-num num-yellow">
                      {accuracyPct(
                        sumRange(stats, r, today, (d) => d.known),
                        sumRange(stats, r, today, (d) => d.reviews),
                      )}
                    </span>
                    <span className="range-label">{rangeLabel[r]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {widgets.levelDistribution && (
            <div className="widget">
              <h3 className="widget-title">{t.dashboard.levelDistribution}</h3>
              <div className="level-bars">
                {levelCounts.map((count, lv) => (
                  <div key={lv} className="level-bar-row">
                    <span className={`level-chip lv-${lv}`}>{fmt(t.dashboard.levelShort, { n: lv })}</span>
                    <span className="level-bar-track">
                      <span className={`level-bar-fill lv-bg-${lv}`} style={{ width: `${(count / maxLevelCount) * 100}%` }} />
                    </span>
                    <span className="level-bar-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {widgets.perDeck && (
            <div className="widget">
              <h3 className="widget-title">{t.dashboard.perDeck}</h3>
              <table className="deck-table">
                <thead>
                  <tr>
                    <th>{t.dashboard.deckColumn}</th>
                    <th>{t.dashboard.reviews}</th>
                    <th>{t.dashboard.known}</th>
                    <th>{t.dashboard.unknown}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.decks.map((deck) => {
                    const sumDeck = (pick: (s: { reviews: number; known: number; unknown: number }) => number) =>
                      Object.values(stats.days).reduce((acc, day) => {
                        const s = day.byDeck[deck.id];
                        return acc + (s ? pick(s) : 0);
                      }, 0);
                    return (
                      <tr key={deck.id}>
                        <td>{deck.name}</td>
                        <td>{sumDeck((s) => s.reviews)}</td>
                        <td>{sumDeck((s) => s.known)}</td>
                        <td>{sumDeck((s) => s.unknown)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {widgets.activity && (
            <div className="widget">
              <h3 className="widget-title">{t.dashboard.activity}</h3>
              <div className="activity-chart">
                {activityDays.map((day) => (
                  <span
                    key={day.date}
                    className="activity-bar"
                    title={`${day.date}: ${day.reviews}`}
                    style={{ height: `${Math.max(4, (day.reviews / maxActivity) * 100)}%` }}
                    data-empty={day.reviews === 0 || undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
