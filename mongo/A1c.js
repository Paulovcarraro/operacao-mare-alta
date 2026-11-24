db.movimentacoes.dropIndex("terminal_1_classe_1_ts_1_peso_kg_-1");
db.movimentacoes.createIndex({ terminal: 1, classe: 1, peso_kg: -1, ts: 1 });
saida(consultaA1());
