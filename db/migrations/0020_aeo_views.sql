CREATE OR REPLACE VIEW aeo_surface_breakdown AS
SELECT r.tenant_id,
       r.run_date,
       q.surface_type,
       COUNT(*)::int AS cnt
FROM aeo_queries q
JOIN aeo_runs r ON r.id = q.run_id
GROUP BY 1,2,3;

-- Domain leaderboard uses first_dealer_domain appearances (when any answer surface exists)
CREATE OR REPLACE VIEW aeo_domain_first_appearances AS
SELECT r.tenant_id,
       r.run_date,
       COALESCE(NULLIF(q.first_dealer_domain,''),'(unknown)') AS domain,
       SUM((q.ours_first)::int)::int AS ours_first_wins,
       COUNT(*)::int AS appearances
FROM aeo_queries q
JOIN aeo_runs r ON r.id = q.run_id
WHERE q.aeo_present = true OR q.fs = true OR q.paa = true OR q.local_pack = true
GROUP BY 1,2,3;
