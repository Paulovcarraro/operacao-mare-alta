db.movimentacoes.createIndex({ terminal: 1, classe: 1, ts: 1, peso_kg: -1 });
saida(consultaA1());
