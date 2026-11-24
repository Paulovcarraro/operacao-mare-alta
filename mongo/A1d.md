@'
# A1: Painel do pátio (T2, Granel, ts >= 2026-06-01)

## Comparação das execuções

| Item | Índice | Stages | docsExamined | keysExamined | nReturned | ms |
|---|---|---|---|---|---|---|
| a) | nenhum | SORT > COLLSCAN | 400.000 | 0 | 20 | 994 |
| b) | {terminal:1, classe:1, ts:1, peso_kg:-1} | FETCH > SORT > IXSCAN | 20 | 9.999 | 20 | 30 |
| c) | {terminal:1, classe:1, peso_kg:-1, ts:1} (ESR) | LIMIT > FETCH > IXSCAN | 20 | 37 | 20 | 4 |

## Diferença entre b) e c)

**Em b)**, o índice segue a ordem do filtro: a B-Tree fica ordenada por
(terminal, classe, ts, peso_kg). Depois das igualdades em terminal e classe, as
chaves estão ordenadas por `ts`, que aqui é um range (`$gte`). Dentro desse
intervalo a ordem por `peso_kg` não é contínua, então o índice não entrega os
dados na ordem pedida pelo `sort({peso_kg:-1})`. O Mongo precisa ler todas as
9.999 chaves do intervalo e ordená-las em memória (stage SORT bloqueante, com
limitAmount 20). Como o peso_kg está dentro do índice, o SORT trabalha sobre as
chaves e só os 20 documentos finais sofrem FETCH, mas o custo de varrer 9.999
chaves permanece.

**Em c)**, aplicando a regra ESR (Equality, Sort, Range), o índice é
(terminal, classe, peso_kg, ts). Depois das igualdades, as chaves já estão
ordenadas por peso_kg decrescente, então percorrer o índice entrega a ordem do
sort sem nenhum SORT em memória. O `ts` entra como limite dentro do próprio scan
(18 seeks pulam as entradas fora do intervalo) e o LIMIT interrompe a leitura
assim que 20 resultados são encontrados: apenas 37 chaves examinadas e 20
documentos lidos.

## Conclusão

Sem índice (a), foram lidos 400.000 documentos. O índice na ordem do filtro (b)
reduziu para 20 documentos, mas ainda examinou 9.999 chaves e manteve o SORT em
memória. O índice ESR (c) eliminou o SORT e reduziu a leitura a 37 chaves e 20
documentos. Índice final mantido na coleção: o ESR.
