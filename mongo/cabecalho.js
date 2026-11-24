const CLASSE_ALVO = "Granel";
const TERMINAL_ALVO = "T2";
const DATA_CORTE = ISODate("2026-06-01T00:00:00Z");
const LAT = -25.4780, LON = -48.4800;   // GeoJSON usa [LON, LAT]

function resumo(e) {
  let wp = e.queryPlanner.winningPlan; if (wp.queryPlan) wp = wp.queryPlan;
  const st = []; (function w(p){ if(!p) return; st.push(p.stage);
    if (p.inputStage) w(p.inputStage); (p.inputStages||[]).forEach(w); })(wp);
  const s = e.executionStats;
  return { stages: st.join(" > "), totalDocsExamined: s.totalDocsExamined,
    totalKeysExamined: s.totalKeysExamined, nReturned: s.nReturned,
    executionTimeMillis: s.executionTimeMillis };
}
function saida(e) {
  print("=== RESUMO ==="); printjson(resumo(e));
  print("=== EXPLAIN COMPLETO ==="); print(EJSON.stringify(e, null, 2));
}
function consultaA1() {
  return db.movimentacoes.find({ terminal: TERMINAL_ALVO, classe: CLASSE_ALVO, ts: { $gte: DATA_CORTE } })
    .sort({ peso_kg: -1 }).limit(20).explain("executionStats");
}