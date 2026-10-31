import clientes from "./clientes.json";
import type { Cliente } from "../domain/regras";

// "Repositório" fake: hoje lê de um JSON fixo, amanhã poderia ser o SQL Server
// sem mudar nada nas regras nem no endpoint.
export function buscarClientePorCpf(cpf: string): Cliente | undefined {
  return (clientes as Cliente[]).find((c) => c.cpf === cpf);
}
