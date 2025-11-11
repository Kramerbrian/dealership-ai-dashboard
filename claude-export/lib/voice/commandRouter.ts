import { speak } from './eleven';
import { apiFetch } from '@/lib/orchestratorClient';
import { KPI_DISPLAY_NAMES, ACRONYM_TO_KPI } from '@/lib/kpi';

export async function handleVoice(cmd: string, domain: string) {
  const lc = cmd.toLowerCase();

  // E-E-A-T
  if (/eeat|e-e-a-t/.test(lc)) {
    try {
      const r = await apiFetch(`/metrics/eeat?domain=${encodeURIComponent(domain)}`);
      const e = r?.pillars || {};
      const msg = `E E A T for ${domain}. Experience ${Math.round(e.experience?.score || 0)}, Expertise ${Math.round(e.expertise?.score || 0)}, Authority ${Math.round(e.authority?.score || 0)}, Trust ${Math.round(e.trust?.score || 0)}. Say "open E-E-A-T" to view details.`;
      await speak(msg);
      return { action: 'open_eeat' };
    } catch (e) {
      await speak(`E E A T data unavailable for ${domain}.`);
      return { error: e };
    }
  }

  // QAI
  if (/qai|quality.*authority|quality index/.test(lc)) {
    try {
      const q = await apiFetch(`/metrics/qai?domain=${encodeURIComponent(domain)}`);
      const msg = `Quality Authority Index is ${Math.round(q?.value || 0)} points, ${q?.delta >= 0 ? 'up' : 'down'} ${Math.abs(q?.delta || 0)}. Top factors: ${q?.factors?.slice(0, 3).map((f: any) => `${f.key} ${Math.round(f.score)}.`).join(' ')}`;
      await speak(msg);
      return { action: 'open_qai', data: q };
    } catch (e) {
      await speak(`Quality Authority Index unavailable for ${domain}.`);
      return { error: e };
    }
  }

  // AI Mention Rate (AVI)
  if (/ai mention|visibility|avi/.test(lc)) {
    try {
      const a = await apiFetch(`/ai-scores?domain=${encodeURIComponent(domain)}`);
      const rate = Math.round(a?.ai_mention_rate || 0);
      await speak(`AI Mention Rate is ${rate} percent. I recommend raising Zero-Click Coverage to lift discovery at the source.`);
      return { action: 'open_avi', data: a };
    } catch (e) {
      await speak(`AI Mention Rate unavailable for ${domain}.`);
      return { error: e };
    }
  }

  // Trust Score (ATI)
  if (/trust score|ati/.test(lc)) {
    try {
      const t = await apiFetch(`/metrics/trust?domain=${encodeURIComponent(domain)}`);
      const score = Math.round(t?.trust_score || 0);
      await speak(`Trust Score is ${score} points.`);
      return { action: 'open_trust', data: t };
    } catch (e) {
      await speak(`Trust Score unavailable for ${domain}.`);
      return { error: e };
    }
  }

  // OEL (Opportunity Efficiency Loss)
  if (/opportunity efficiency loss|o e l|oel|lost opportunity|lost revenue|efficiency loss/.test(lc)) {
    try {
      const res = await apiFetch(`/metrics/oel?domain=${encodeURIComponent(domain)}`);
      const dollars = Math.round(res?.oel || 0).toLocaleString();
      const score = Math.round(res?.score || 0);
      await speak(`Your Opportunity Efficiency Loss is ${dollars} dollars this month. Efficiency score is ${score} out of 100. Say "open O E L" to see the breakdown.`);
      return { action: 'open_oel', data: res };
    } catch (e) {
      await speak(`Opportunity Efficiency Loss data unavailable for ${domain}.`);
      return { error: e };
    }
  }

  // Open OEL modal
  if (/open o e l|open opportunity loss|open oel|show o e l/.test(lc)) {
    await speak('Opening Opportunity Efficiency Loss details.');
    return { action: 'open_oel_modal' };
  }

  // Schema Coverage
  if (/fix schema|schema coverage/.test(lc)) {
    try {
      await apiFetch('/fix/deploy', { method: 'POST', body: { kind: 'schema', domain } });
      await speak('Schema Coverage fix deployed. Results will appear in the Decision Feed.');
      return { action: 'fix_deployed', kind: 'schema' };
    } catch (e) {
      await speak('Failed to deploy schema fix.');
      return { error: e };
    }
  }

  // Generic KPI lookup
  const kpiMatch = Object.keys(ACRONYM_TO_KPI).find(acronym => 
    new RegExp(acronym.toLowerCase(), 'i').test(lc)
  );
  if (kpiMatch) {
    const kpiKey = ACRONYM_TO_KPI[kpiMatch];
    const displayName = KPI_DISPLAY_NAMES[kpiKey];
    await speak(`I can report on ${displayName}. Fetching data now.`);
    return { action: 'fetch_kpi', kpi: kpiKey };
  }

  // Fallback
  await speak(`I can report on Quality Authority Index, E E A T, AI Mention Rate, Zero-Click Coverage, Review Trust Score, Core Web Vitals, and Revenue at Risk. Which one?`);
  return { action: 'help' };
}

