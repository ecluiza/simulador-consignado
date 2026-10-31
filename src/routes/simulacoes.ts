import { Router } from "express";
import { z } from "zod";
import { PRAZO_MAXIMO, VALOR_MINIMO, simular } from "../domain/regras";
import { buscarClientePorCpf } from "../data/clientes";

// Validação da ENTRADA (formato). Regra de negócio fica no domínio.
const entradaSchema = z.object({
  cpf: z
    .string({ error: (i) => (i.input === undefined ? "cpf é obrigatório" : "cpf deve ser texto") })
    .regex(/^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/, "cpf deve ter 11 dígitos (com ou sem máscara)"),
  valor: z
    .number({ error: (i) => (i.input === undefined ? "valor é obrigatório" : "valor deve ser número") })
    .min(VALOR_MINIMO, `valor mínimo é R$ ${VALOR_MINIMO}`)
    .refine((v) => Number.isFinite(v) && Math.round(v * 100) === v * 100, "valor deve ter no máximo 2 casas decimais"),
  prazo: z
    .number({ error: (i) => (i.input === undefined ? "prazo é obrigatório" : "prazo deve ser número") })
    .int("prazo deve ser um número inteiro de meses")
    .min(1, "prazo deve ser de pelo menos 1 mês")
    .max(PRAZO_MAXIMO, `prazo máximo é ${PRAZO_MAXIMO} meses`),
});

export const simulacoesRouter = Router();

simulacoesRouter.post("/simulacoes", (req, res) => {
  const resultado = entradaSchema.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({
      erro: "Entrada inválida",
      detalhes: resultado.error.issues.map((i) => ({ campo: i.path.join("."), mensagem: i.message })),
    });
  }

  const { cpf, valor, prazo } = resultado.data;
  const cliente = buscarClientePorCpf(cpf.replace(/\D/g, ""));
  if (!cliente) {
    return res.status(404).json({ erro: "Cliente não encontrado" });
  }

  return res.status(200).json(simular(cliente, valor, prazo));
});
