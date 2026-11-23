# Previsões (pré-registro)

## A1: Painel do pátio (T2, Granel, ts >= 2026-06-01)
- a) Sem índice: COLLSCAN + SORT. docsExamined ~400.000, keysExamined 0,
  SORT em memória: sim, nReturned 20.
- b) Índice {terminal, classe, ts, peso_kg:-1}: IXSCAN + FETCH + SORT.
  docsExamined ~10.000, keysExamined ~10.000, SORT em memória: sim, nReturned 20.
- c) Índice ESR {terminal, classe, peso_kg:-1, ts}: IXSCAN + FETCH (LIMIT no topo).
  docsExamined 20, keysExamined poucas dezenas, SORT em memória: não, nReturned 20.
- Justificativa: sem índice lê a coleção inteira. Em (b) o range em ts vem antes
  do peso_kg, então a ordem do índice não serve ao sort e precisa ordenar em memória.
  Em (c) depois das igualdades o índice está ordenado por peso_kg, então o sort vem
  de graça e o LIMIT para o scan após achar 20.

## A2: Incidente
- Sem índice: erro, "unable to find index for $geoNear query" ($near exige 2dsphere).
- Com índice 2dsphere: LIMIT > FETCH > GEO_NEAR_2DSPHERE, sem SORT (o $near já
  devolve por distância), nReturned 10, keysExamined entre dezenas e poucas centenas.
- Cuidado: o GeoJSON usa [lon, lat], o Google Maps copia "lat, lon".

## A3: TTL
- Hipótese inicial: o campo registrado_em está gravado como string ISO e não como
  Date. O TTL só expira campos BSON Date, então o monitor ignora esses documentos.
  Vou verificar com $type e com getIndexes().

## A4: Consulta coberta
- Com índice {tipo, terminal, container} e _id:0: PROJECTION_COVERED > IXSCAN,
  docsExamined 0, keysExamined ~16.000 (≈ nReturned).
- Sem _id:0: aparece FETCH (PROJECTION_DEFAULT > FETCH > IXSCAN), docsExamined ~16.000,
  porque o _id não está no índice e o Mongo precisa ler o documento.