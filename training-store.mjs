// CYCLOPS training records for the supervisor dashboard: course progress, exam results and finished videos.
// Works with any function shaped like pg's query(text, params) -> { rows } (a pg Pool, or PGlite in tests),
// or with the in-memory store when no database is configured. Training records, never a certification.

export const COURSES = ['UT', 'RT', 'MT', 'PT', 'VT', 'APVG', 'APL', 'APE'];
const KINDS = new Set(['progress', 'exam', 'video']);

// Checks and normalises one event sent by the app. Returns null when it is not valid.
export function cleanEvent(input) {
  if (!input || typeof input !== 'object') return null;
  const kind = String(input.kind || '');
  const course = String(input.course || '').toUpperCase();
  if (!KINDS.has(kind) || !COURSES.includes(course)) return null;
  const int = (v, max) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 && n <= max ? n : null; };
  const ev = { kind, course, seen: null, total: null, score: null };
  if (kind === 'progress') {
    ev.total = int(input.total, 200); ev.seen = int(input.seen, 200);
    if (ev.total == null || ev.seen == null || ev.total < 1) return null;
    ev.seen = Math.min(ev.seen, ev.total);
  }
  if (kind === 'exam') { ev.score = int(input.score, 100); if (ev.score == null) return null; }
  return ev;
}

const SCHEMA = `CREATE TABLE IF NOT EXISTS cyclops_training (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  kind TEXT NOT NULL,
  course TEXT NOT NULL,
  seen INTEGER,
  total INTEGER,
  score INTEGER,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cyclops_training_user_course ON cyclops_training (username, course);`;

// One row per person and course: best progress, exam attempts / best / last score, video finished.
const SUMMARY = `SELECT username, course,
  MAX(seen) FILTER (WHERE kind = 'progress') AS seen,
  MAX(total) FILTER (WHERE kind = 'progress') AS total,
  COUNT(*) FILTER (WHERE kind = 'exam')::int AS attempts,
  MAX(score) FILTER (WHERE kind = 'exam') AS best,
  (ARRAY_AGG(score ORDER BY at DESC, id DESC) FILTER (WHERE kind = 'exam'))[1] AS last_score,
  BOOL_OR(kind = 'video') AS video,
  MAX(at) AS last_at
FROM cyclops_training GROUP BY username, course ORDER BY username, course`;

export function sqlStore(query) {
  return {
    kind: 'database',
    async init() { for (const statement of SCHEMA.split(';').map((s) => s.trim()).filter(Boolean)) await query(statement); },
    async record(user, ev) {
      await query('INSERT INTO cyclops_training (username, kind, course, seen, total, score) VALUES ($1, $2, $3, $4, $5, $6)', [user, ev.kind, ev.course, ev.seen, ev.total, ev.score]);
    },
    async summary() {
      const { rows } = await query(SUMMARY);
      return rows.map((r) => ({ user: r.username, course: r.course, seen: r.seen == null ? null : Number(r.seen), total: r.total == null ? null : Number(r.total), attempts: Number(r.attempts || 0), best: r.best == null ? null : Number(r.best), last: r.last_score == null ? null : Number(r.last_score), video: Boolean(r.video), lastAt: r.last_at ? new Date(r.last_at).toISOString() : null }));
    }
  };
}

// Same behaviour without a database; used by the tests. Lost when the server restarts.
export function memoryStore() {
  const rows = [];
  return {
    kind: 'memory',
    async init() {},
    async record(user, ev) { rows.push({ user, ...ev, at: Date.now(), id: rows.length }); },
    async summary() {
      const groups = new Map();
      for (const r of rows) { const k = `${r.user}\u0000${r.course}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
      return [...groups.values()].map((g) => {
        const prog = g.filter((r) => r.kind === 'progress'), exams = g.filter((r) => r.kind === 'exam');
        const latest = exams.slice().sort((a, b) => b.at - a.at || b.id - a.id)[0];
        return { user: g[0].user, course: g[0].course, seen: prog.length ? Math.max(...prog.map((r) => r.seen)) : null, total: prog.length ? Math.max(...prog.map((r) => r.total)) : null, attempts: exams.length, best: exams.length ? Math.max(...exams.map((r) => r.score)) : null, last: latest ? latest.score : null, video: g.some((r) => r.kind === 'video'), lastAt: new Date(Math.max(...g.map((r) => r.at))).toISOString() };
      }).sort((a, b) => a.user.localeCompare(b.user) || a.course.localeCompare(b.course));
    }
  };
}
