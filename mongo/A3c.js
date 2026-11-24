printjson(db.alertas.find({ sensor: /^TESTE/ }, { sensor: 1, registrado_em: 1, _id: 0 }).toArray());
