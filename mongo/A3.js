db.alertas.createIndex({ registrado_em: 1 }, { expireAfterSeconds: 2592000 });
print("--- INDICES ---");        printjson(db.alertas.getIndexes());
print("--- TOTAL ---");          print(db.alertas.countDocuments());
print("--- TIPOS DO CAMPO ---"); printjson(db.alertas.aggregate([{ $group: { _id: { $type: "$registrado_em" }, n: { $sum: 1 } } }]).toArray());
print("--- EXEMPLO ---");        printjson(db.alertas.findOne());
