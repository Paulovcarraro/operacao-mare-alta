db.alertas.insertMany([
  { sensor: "TESTE_DATE",   nivel: "info", registrado_em: new Date("2026-01-01") },
  { sensor: "TESTE_STRING", nivel: "info", registrado_em: "2026-01-01T00:00:00.000Z" }
]);
print("inseridos: " + db.alertas.countDocuments({ sensor: /^TESTE/ }));
