// Regras de negócio do consignado — SEM nada de HTTP aqui.
// Tudo que está neste arquivo pode ser testado sozinho, sem subir servidor.

export const PERCENTUAL_MARGEM = 0.35; // 35% da renda líquida
export const TAXA_MENSAL = 0.018; // 1,8% ao mês
export const VALOR_MINIMO = 500;
export const PRAZO_MAXIMO = 84;

export interface Cliente {
  cpf: string; // só dígitos
  renda: number; // renda líquida mensal
  parcelasAtivas: number[];
}

export interface ResultadoSimulacao {
  parcela: number;
  margemDisponivel: number;
  cabe: boolean;
  valorMaximo: number | null; // só preenchido quando NÃO cabe
  observacao?: string;
}

/** Arredonda para centavos (2 casas). */
export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** Margem disponível = 35% da renda − soma das parcelas ativas. Pode ser negativa. */
export function calcularMargemDisponivel(cliente: Cliente): number {
  const comprometido = cliente.parcelasAtivas.reduce((soma, p) => soma + p, 0);
  return arredondar(cliente.renda * PERCENTUAL_MARGEM - comprometido);
}

/**
 * Parcela pela tabela Price:
 *   PMT = PV * i / (1 - (1 + i)^-n)
 */
export function calcularParcela(valor: number, prazo: number, taxa = TAXA_MENSAL): number {
  return arredondar((valor * taxa) / (1 - Math.pow(1 + taxa, -prazo)));
}

/**
 * Caminho inverso da Price: dado o quanto cabe por mês, qual o maior valor?
 *   PV = PMT * (1 - (1 + i)^-n) / i
 * Arredonda para BAIXO (centavos) para garantir que a parcela resultante caiba.
 */
export function calcularValorMaximo(margem: number, prazo: number, taxa = TAXA_MENSAL): number {
  if (margem <= 0) return 0;
  const bruto = (margem * (1 - Math.pow(1 + taxa, -prazo))) / taxa;
  let valor = Math.floor(bruto * 100) / 100;
  // Como a parcela é arredondada em centavos, alguns centavos a mais de valor
  // ainda geram a mesma parcela. Ajusta para o MAIOR valor cuja parcela cabe.
  while (valor > 0 && calcularParcela(valor, prazo, taxa) > margem) {
    valor = arredondar(valor - 0.01);
  }
  while (calcularParcela(arredondar(valor + 0.01), prazo, taxa) <= margem) {
    valor = arredondar(valor + 0.01);
  }
  return valor;
}

/** Junta tudo: é o que o endpoint chama. */
export function simular(cliente: Cliente, valor: number, prazo: number): ResultadoSimulacao {
  const parcela = calcularParcela(valor, prazo);
  const margemDisponivel = calcularMargemDisponivel(cliente);
  const cabe = margemDisponivel > 0 && parcela <= margemDisponivel;

  if (cabe) {
    return { parcela, margemDisponivel, cabe, valorMaximo: null };
  }

  const maximo = calcularValorMaximo(margemDisponivel, prazo);

  if (maximo < VALOR_MINIMO) {
    return {
      parcela,
      margemDisponivel,
      cabe,
      valorMaximo: null,
      observacao:
        margemDisponivel <= 0
          ? "Cliente sem margem disponível."
          : `Nenhum valor a partir de R$ ${VALOR_MINIMO} cabe na margem neste prazo.`,
    };
  }

  return { parcela, margemDisponivel, cabe, valorMaximo: maximo };
}
