# Decisões

## Stack

Escolhi **Node.js com TypeScript** porque, entre as opções do teste, é a mais próxima do que uso no dia a dia (JavaScript e PHP/Laravel). Usei:

- **Express** para o endpoint, por ser simples e direto.
- **Zod** para validar a entrada, porque gera mensagens de erro claras por campo.
- **Vitest + Supertest** para os testes da regra e do endpoint.

## Organização

Separei as regras de negócio do endpoint:

- `src/domain/regras.ts` tem só funções puras: margem, parcela (Price), valor máximo e a simulação. Não conhece HTTP nem a fonte dos dados.
- `src/routes/simulacoes.ts` só valida o formato da entrada, busca o cliente e chama a regra.
- `src/data/` lê os clientes de um JSON fixo.

Com isso, a regra é testada sem subir servidor, e trocar o JSON por um banco de dados não mexe na regra. É a mesma ideia que uso no Laravel: Controller fino e lógica num Service.

## O que assumi

- **Parcela sempre calculada pelo sistema.** No caso da Dona Marlene, o enunciado informa parcela de R$ 173,40, mas pela Price a 1,8% a.m. em 72 meses o valor é **R$ 149,34**. Por isso o endpoint não recebe parcela, só valor e prazo.
- **Arredondamento em centavos.** Parcela e margem têm 2 casas decimais. A comparação "cabe" usa a parcela já arredondada, que é o valor que de fato seria descontado.
- **Parcela igual à margem cabe** (`parcela <= margem`).
- **Margem zero ou negativa nunca cabe.** O cliente 333 tem margem de −R$ 23,70. Nesse caso retorno `cabe: false`, `valorMaximo: null` e uma observação explicando o motivo.
- **Valor máximo** é o maior valor, em centavos, cuja parcela cabe na margem no prazo pedido. Como a parcela é arredondada, alguns centavos a mais ainda geram a mesma parcela, e eu ajusto para pegar o maior. Se o máximo ficar abaixo de R$ 500, não faz sentido oferecer, então retorno `null` com observação.
- **Entradas fora das regras são erro 400:** valor abaixo de R$ 500, prazo fora de 1 a 84 meses, prazo não inteiro, valor com mais de 2 casas decimais, campos ausentes ou com tipo errado. Considerei que essas simulações nem deveriam existir. CPF não cadastrado retorna 404.
- **CPF:** aceito com ou sem máscara e valido só o formato (11 dígitos). Não validei os dígitos verificadores porque os CPFs do enunciado (111.111.111-11, 222..., 333...) seriam reprovados nessa validação.

## O que deixei de fora e por quê

- **IOF, seguro e tarifas:** não estavam nas regras. Num sistema real eu calcularia também o CET, que muda o custo para o cliente.
- **Taxa por banco ou convênio:** usei 1,8% fixo, como pedido. Em produção, a taxa viria do produto ou do banco escolhido.
- **Sugerir outro prazo:** quando não cabe, retorno o valor máximo no mesmo prazo, que foi o pedido. Uma evolução natural seria sugerir também o menor prazo em que o valor pedido caberia, que é a alternativa que eu ofereceria primeiro à Dona Marlene.
- **Dinheiro em `number`:** atende o teste porque arredondo em centavos, mas em produção eu usaria inteiros em centavos ou uma biblioteca de decimais para evitar erro de ponto flutuante.
- **Banco de dados, autenticação, Docker e tela:** o enunciado disse que não eram necessários.

## Uso de IA

Usei IA como apoio para estruturar o projeto, conferir a fórmula Price e revisar o código. Os testes automatizados me ajudaram a validar as contas, e um deles encontrou o detalhe de arredondamento do valor máximo, que corrigi.
