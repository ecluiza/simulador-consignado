# Simulador de Consignado — Teste Técnico Grupo Presença

API em **Node.js + TypeScript** com um endpoint `POST /simulacoes` que calcula a parcela pela tabela Price, a margem consignável disponível do cliente e, quando a parcela não cabe, o maior valor possível no mesmo prazo.

## Requisitos

- Node.js 20 ou superior

## Como rodar

```bash
npm install
npm start          # sobe em http://localhost:3000
npm test           # roda os testes automatizados (Vitest)
npm run typecheck  # checagem de tipos do TypeScript
```

## Exemplo

```bash
curl -X POST http://localhost:3000/simulacoes \
  -H "Content-Type: application/json" \
  -d '{"cpf": "111.111.111-11", "valor": 6000, "prazo": 72}'
```

Resposta:

```json
{ "parcela": 149.34, "margemDisponivel": 155, "cabe": true, "valorMaximo": null }
```

Quando não cabe, `valorMaximo` traz o maior valor (em centavos) cuja parcela cabe na margem nesse prazo. Se nem o valor mínimo de R$ 500 couber, `valorMaximo` vem `null` com uma `observacao`.

### Erros

| Situação | Status |
|---|---|
| CPF, valor ou prazo inválidos / ausentes | 400, com a lista de campos e mensagens |
| JSON malformado | 400 |
| CPF não cadastrado | 404 |

## Estrutura

```
src/
  domain/regras.ts       regras de negócio puras (margem, Price, valor máximo)
  data/clientes.json     base fixa com os 3 clientes do enunciado
  data/clientes.ts       busca de cliente por CPF
  routes/simulacoes.ts   endpoint: valida a entrada e chama o domínio
  app.ts / server.ts     configuração do Express
tests/
  regras.test.ts           testes unitários das regras
  simulacoes.api.test.ts   testes do endpoint (entradas válidas e inválidas)
```

A regra de margem fica isolada em `src/domain/regras.ts`, sem dependência de HTTP, para ser testada e reaproveitada sozinha.

Decisões e premissas estão em [DECISOES.md](./DECISOES.md).
As respostas da Parte 1 (raciocínio) estão em [PARTE1.md](./PARTE1.md).
