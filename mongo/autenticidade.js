const a = db.movimentacoes.aggregate([
  { $match: { classe: CLASSE_ALVO, terminal: TERMINAL_ALVO } },
  { $group: { _id: null, n: { $sum: 1 }, kg: { $sum: "$peso_kg" } } }]).toArray()[0];
print("CODIGO=LP-241914722-" + a.n + "-" + (a.kg % 99991));
