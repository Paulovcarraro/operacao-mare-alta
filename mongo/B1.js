db.movimentacoes.createIndex({ classe: 1, ts: 1, terminal: 1, peso_kg: 1 });
const pipe = [
  { $match: { classe: CLASSE_ALVO, ts: { $gte: DATA_CORTE } } },
  { $group: { _id: "$terminal", total_mov: { $sum: 1 }, peso_total: { $sum: "$peso_kg" },
              peso_medio: { $avg: "$peso_kg" }, maior_peso: { $max: "$peso_kg" } } },
  { $sort: { peso_total: -1 } },
  { $limit: 3 },
  { $project: { _id: 0, terminal: "$_id", total_mov: 1, peso_total: 1, peso_medio: 1, maior_peso: 1 } }
];
print("--- RESULTADO ---");
printjson(db.movimentacoes.aggregate(pipe).toArray());
print("--- DOCS QUE CASAM NO MATCH ---");
print(db.movimentacoes.countDocuments({ classe: CLASSE_ALVO, ts: { $gte: DATA_CORTE } }));
print("--- EXPLAIN ---");
print(EJSON.stringify(db.movimentacoes.explain("executionStats").aggregate(pipe), null, 2));
