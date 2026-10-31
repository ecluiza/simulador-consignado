# Parte 1 — Raciocínio

## 1. Dona Marlene

**Margem disponível**

- 35% da renda líquida: 2.600 × 0,35 = **R$ 910,00**
- Parcelas ativas: 310 + 445 = **R$ 755,00**
- Margem disponível: 910 − 755 = **R$ 155,00**

**Parcela**

Comparando com a parcela informada (R$ 173,40), não caberia. Mas recalculei a parcela pela tabela Price com as regras do teste (1,8% a.m., 72 meses):

PMT = PV × i / (1 − (1 + i)^−n) = 6.000 × 0,018 / (1 − 1,018^−72) ≈ **R$ 149,34**

**Conclusão:** a parcela correta é R$ 149,34, que é menor que a margem de R$ 155,00 (sobram R$ 5,66). **Pode enviar ao banco**, respeitando também o valor mínimo (R$ 6.000 ≥ R$ 500) e o prazo máximo (72 ≤ 84).

Antes de enviar, eu verificaria de onde saiu o valor de R$ 173,40. Ele pode ter sido calculado com outra taxa, ter seguro ou tarifa embutidos, ou ser um erro de digitação. Se a taxa real do banco for maior que 1,8%, a parcela muda e talvez não caiba. Por isso o sistema deve sempre calcular a parcela e não aceitar um valor pronto.

**Se não coubesse, as alternativas seriam:**

| Alternativa | Resultado |
|---|---|
| Manter o valor e alongar o prazo para 84 meses | parcela de R$ 139,08 |
| Manter os 72 meses e reduzir o valor | máximo de R$ 6.227 |
| Usar o prazo máximo e o valor máximo | até R$ 6.686 em 84 meses |
| Refinanciar ou portar um dos contratos ativos | pode liberar margem; depende das condições do contrato atual |

**O que eu sugeriria primeiro:** alongar o prazo, porque ela recebe o valor que precisa. Eu deixaria claro para ela que, no prazo maior, o total pago no fim é maior. Se ela não precisar exatamente de R$ 6.000, a segunda opção seria ajustar o valor para o máximo que cabe em 72 meses.

## 2. "Quando o cliente tiver margem negativa, o sistema deve bloquear a digitação"

Antes de implementar, eu perguntaria ao gerente:

1. **Bloquear tudo ou só operações novas?**
   - Se for só contrato novo, eu deixaria passar refinanciamento e portabilidade, que podem até reduzir a parcela e liberar margem.
   - Se for tudo, o bloqueio fica antes de qualquer tipo de proposta.

2. **É bloqueio de verdade ou um alerta?**
   - Se for bloqueio, o sistema impede salvar e mostra o motivo.
   - Se for alerta, a proposta pode seguir com um aviso e a justificativa fica registrada.
   - Se existir exceção autorizada por um supervisor, preciso de um perfil de permissão e de um registro de quem liberou.

3. **De onde vem a margem?**
   - Se o atendente digita a margem, o bloqueio pode ser contornado digitando outro valor, então eu buscaria uma fonte confiável.
   - Se vem de uma consulta ao INSS ou ao convênio, preciso saber de quando é essa consulta. Uma margem de dias atrás pode ter mudado, então eu definiria uma validade e consultaria de novo antes de bloquear.

4. **E margem zero?** Ela também bloqueia, ou só quando for menor que zero? Muda um sinal na regra (`< 0` ou `<= 0`).

5. **Bloquear em que momento?**
   - Logo ao informar o CPF, o atendente nem perde tempo preenchendo o resto.
   - Só ao enviar ao banco, ele consegue montar a proposta e resolver depois.

6. **O que o atendente vê?** Só "bloqueado", ou o motivo e o valor da margem? Mostrar o motivo reduz chamados de suporte.

## 3. "O banco aprovou às 18h, mas no sistema ainda aparece 'enviada ao banco'"

Hipóteses, da mais provável para a menos provável:

1. **O retorno do banco não chegou.** O webhook do banco falhou, o endpoint estava fora do ar ou a mensagem não foi publicada na fila (RabbitMQ).
   - Primeiro eu olharia os logs de entrada do webhook, filtrando pelo número da proposta e pelo horário, e a fila de mensagens com erro (dead-letter).

2. **O retorno chegou, mas não foi processado.** O processamento deu erro: a proposta não foi encontrada pelo ID, o status veio com um nome diferente do esperado, ou houve uma exceção no código.
   - Primeiro eu olharia os logs de erro do processamento e compararia o status que o banco mandou com os status que o sistema conhece.

3. **A atualização depende de um job agendado** que consulta o banco, e ele não rodou, travou ou está atrasado.
   - Primeiro eu olharia o horário da última execução do job e se ele terminou com erro.

4. **Problema do lado do banco.** O banco aprovou no sistema dele, mas a API ainda devolve o status antigo, ou houve uma falha de integração do lado deles.
   - Primeiro eu consultaria a API do banco manualmente para essa proposta e veria o que ela responde.

5. **A tela está desatualizada.** O status já foi atualizado no banco de dados, mas a tela mostra cache ou a página não foi recarregada.
   - Primeiro eu consultaria o status direto no banco de dados.

Na prática, o mais rápido é começar consultando o status direto no banco de dados (já descarta a hipótese 5) e depois seguir o caminho do retorno: o banco enviou? chegou? foi processado? Isso aponta em qual etapa o problema está.
