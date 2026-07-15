import React, { useEffect, useMemo, useState } from 'react';
import { Check, Loader } from 'lucide-react';

const personKey = (name) => String(name || '').trim().toLowerCase();

/**
 * A reusable, Firestore-backed couple poll. Poll definitions live in
 * tripData/tripPolls/polls and each partner's response is stored separately
 * under responses.mike / responses.adam.
 */
const TripPollCard = ({ poll, currentUser, onSubmit }) => {
  const me = personKey(currentUser);
  const myResponse = poll?.responses?.[me];
  const [answers, setAnswers] = useState(myResponse?.answers || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAnswers(myResponse?.answers || {});
  }, [poll?.id, myResponse?.submittedAt]);

  useEffect(() => {
    let timer;
    try {
      const focusedPoll = new URLSearchParams(window.location.search).get('poll');
      if (focusedPoll === poll?.id) {
        timer = window.setTimeout(() => {
          document.getElementById(`trip-poll-${poll.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    } catch {
      // A malformed query string should never hide the poll.
    }
    return () => window.clearTimeout(timer);
  }, [poll?.id]);

  const questions = poll?.questions || [];
  const complete = useMemo(
    () => questions.length > 0 && questions.every((question) => answers[question.id]),
    [answers, questions]
  );

  if (!poll || poll.status !== 'open') return null;

  const save = async () => {
    if (!complete || saving) return;
    setSaving(true);
    try {
      await onSubmit(poll.id, answers);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id={`trip-poll-${poll.id}`}
      data-testid="trip-poll-card"
      className="mb-6 scroll-mt-5 overflow-hidden rounded-3xl border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-950/55 via-violet-950/50 to-sky-950/45 shadow-[0_18px_60px_rgba(168,85,247,0.16)]"
    >
      <div className="h-1 bg-gradient-to-r from-red-400 via-yellow-300 via-emerald-400 via-sky-400 to-fuchsia-500" />
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-300/80">Your vote requested</p>
            <h2 className="mt-1 text-xl font-black text-white md:text-2xl">{poll.emoji || '🚆'} {poll.title}</h2>
            {poll.subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-violet-100/75">{poll.subtitle}</p>}
          </div>
          <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Train</p>
            <p className="mt-0.5 text-xs font-semibold text-white/85">Sat 6:30 PM</p>
            <p className="text-xs text-white/55">back Mon 11:35</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {['mike', 'adam'].map((person) => {
            const responded = Boolean(poll.responses?.[person]?.submittedAt);
            return (
              <span key={person} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${responded ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-white/45'}`}>
                {responded && <Check className="h-3 w-3" />}
                {person === 'mike' ? 'Mike' : 'Adam'} {responded ? 'voted' : 'waiting'}
              </span>
            );
          })}
        </div>

        {poll.note && (
          <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/5 px-3.5 py-3 text-xs leading-relaxed text-amber-100/75">
            {poll.note}
          </div>
        )}

        <div className="mt-5 space-y-5">
          {questions.map((question, questionIndex) => (
            <fieldset key={question.id} className="min-w-0">
              <legend className="mb-2.5 text-sm font-bold text-white">
                <span className="mr-2 text-fuchsia-300/70">{questionIndex + 1}.</span>{question.label}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(question.options || []).map((option) => {
                  const selected = answers[question.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      data-testid={`poll-option-${question.id}-${option.id}`}
                      aria-pressed={selected}
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                      className={`rounded-2xl border p-3.5 text-left transition active:scale-[0.99] ${selected ? 'border-fuchsia-300/70 bg-fuchsia-400/20 shadow-[0_0_0_1px_rgba(232,121,249,0.2)]' : 'border-white/10 bg-white/[0.045] hover:border-white/25 hover:bg-white/[0.075]'}`}
                    >
                      <span className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-fuchsia-200 bg-fuchsia-300 text-fuchsia-950' : 'border-white/25 text-transparent'}`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-white/95">{option.label}</span>
                          {option.detail && <span className="mt-1 block text-xs leading-relaxed text-white/50">{option.detail}</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <button
          type="button"
          data-testid="submit-trip-poll"
          onClick={save}
          disabled={!complete || saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-fuchsia-950/30 transition hover:from-fuchsia-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-35 active:scale-[0.99]"
        >
          {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {myResponse ? 'Update my picks' : 'Send my picks'}
        </button>
        {!complete && <p className="mt-2 text-center text-[11px] text-white/35">Choose one answer for each question.</p>}
      </div>
    </section>
  );
};

export default TripPollCard;
