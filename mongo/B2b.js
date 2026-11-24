const pipe = [
  { $match: { classe: CLASSE_ALVO } },
  { $group: { _id: "$terminal", kg_total: { $sum: "$peso_kg" }, mov: { $sum: 1 } } },
  { $sort: { kg_total: -1 } },
  { $limit: 3 },
  { $project: { _id: 0, terminal: "$_id", kg_total: 1, mov: 1 } }
];
print("--- SAIDA DO PIPELINE CORRIGIDO ---");
printjson(db.movimentacoes.aggregate(pipe).toArray());
print("--- PROVA INDEPENDENTE (soma por terminal, calculada separadamente) ---");
["T1","T2","T3","T4","T5"].forEach(t => {
  const r = db.movimentacoes.aggregate([
    { $match: { classe: CLASSE_ALVO, terminal: t } },
    { $group: { _id: null, kg: { $sum: "$peso_kg" }, n: { $sum: 1 } } }]).toArray()[0];
  print(t + "  kg_total=" + r.kg + "  mov=" + r.n);
});
print("--- EXPLAIN ---");
print(EJSON.stringify(db.movimentacoes.explain("executionStats").aggregate(pipe), null, 2));
