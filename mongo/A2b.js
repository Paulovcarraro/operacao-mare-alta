const q = { posicao: { $near: { $geometry: { type: "Point", coordinates: [LON, LAT] }, $maxDistance: 300 } } };
print("--- RESULTADO (10 mais proximos) ---");
const r = db.movimentacoes.find(q).limit(10).toArray();
print("quantidade: " + r.length);
printjson(r.map(d => ({ _id: d._id, container: d.container, tipo: d.tipo, coord: d.posicao.coordinates })));
print("--- EXPLAIN ---");
saida(db.movimentacoes.find(q).limit(10).explain("executionStats"));
