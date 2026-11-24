db.movimentacoes.createIndex({ tipo: 1, terminal: 1, container: 1 });
print("--- COM _id:0 ---");
saida(db.movimentacoes.find({ tipo: "inspecao", terminal: TERMINAL_ALVO }, { _id: 0, container: 1 }).explain("executionStats"));
print("--- SEM _id:0 ---");
saida(db.movimentacoes.find({ tipo: "inspecao", terminal: TERMINAL_ALVO }, { container: 1 }).explain("executionStats"));
