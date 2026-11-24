# Previsões (pré-registro)

## PARTE A 

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

## PARTE B

## B1: Relatório gerencial (Granel, ts >= 2026-06-01)
- Índice criado: {classe:1, ts:1, terminal:1, peso_kg:1}.
- Plano esperado do 1º estágio: IXSCAN com bounds em classe e ts, sem COLLSCAN.
  Como o índice contém terminal e peso_kg (os únicos campos usados depois), espero
  consulta coberta (sem FETCH, docsExamined 0).
- Entram no $group cerca de 50.000 documentos: Granel é ~1/4 de 400.000 (100.000)
  e ~50% deles são de 01/06 em diante (no A1 vi ~10.000 por terminal).
- Sem SORT em memória sobre documentos: o $sort roda sobre apenas 5 grupos.
- Saída: 3 documentos (os 3 terminais de maior peso_total), sem o campo _id.

## B2: Debug arquitetural (Granel, todo o período)
- Pipeline original: COLLSCAN nos 400.000 documentos, pois o $match vem por último
  e depois de $group. O $group cria ~20 grupos (5 terminais x 4 classes).
- Saída esperada do original: kg_total igual a 0 em todos os grupos, porque
  "peso_kg" (sem $) é um texto literal e o $project inicial descarta peso_kg.
  Como o $limit vem antes do $sort, os 3 grupos são arbitrários, e o $match final
  deixa só os de classe Granel: resultado entre 0 e 3 documentos.
- Defeitos esperados: 4 de lógica (sem $ no campo, $project que remove peso_kg,
  $limit antes do $sort, $match no final) e 2 de desempenho (COLLSCAN por filtrar
  só no final e agrupar todas as classes).
- Pipeline corrigido: IXSCAN usando o mesmo índice do B1 (prefixo classe), cerca de
  100.000 documentos entrando no $group, 5 grupos, 3 retornados com kg_total correto.
