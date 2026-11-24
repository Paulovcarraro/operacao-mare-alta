const pipe = [
  { $project: { terminal: 1, classe: 1 } },
  { $group: { _id: { terminal: "$terminal", classe: "$classe" }, kg_total: { $sum: "peso_kg" }, mov: { $sum: 1 } } },
  { $limit: 3 },
  { $sort: { kg_total: -1 } },
  { $match: { "_id.classe": CLASSE_ALVO } }
];
print("--- SAIDA DO PIPELINE ORIGINAL ---");
printjson(db.movimentacoes.aggregate(pipe).toArray());
print("--- EXPLAIN ---");
print(EJSON.stringify(db.movimentacoes.explain("executionStats").aggregate(pipe), null, 2));
