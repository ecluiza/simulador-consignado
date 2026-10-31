import { describe, expect, it } from "vitest";
import {
  calcularMargemDisponivel,
  calcularParcela,
  calcularValorMaximo,
  simular,
} from "../src/domain/regras";

const marlene = { cpf: "11111111111", renda: 2600, parcelasAtivas: [310, 445] };
const semContratos = { cpf: "22222222222", renda: 4150, parcelasAtivas: [] };
const margemNegativa = { cpf: "33333333333", renda: 1518, parcelasAtivas: [265, 180, 110] };

describe("margem", () => {
  it("calcula 35% da renda menos as parcelas ativas", () => {
    expect(calcularMargemDisponivel(marlene)).toBe(155);
    expect(calcularMargemDisponivel(semContratos)).toBe(1452.5);
  });

  it("pode ser negativa", () => {
    expect(calcularMargemDisponivel(margemNegativa)).toBe(-23.7);
  });
});

describe("parcela (Price)", () => {
  it("R$ 6.000 em 72x a 1,8% dá R$ 149,34 (e não os R$ 173,40 do enunciado)", () => {
    expect(calcularParcela(6000, 72)).toBe(149.34);
  });

  it("prazo de 1 mês é valor + juros", () => {
    expect(calcularParcela(1000, 1)).toBe(1018);
  });
});

describe("valor máximo", () => {
  it("parcela do valor máximo cabe na margem", () => {
    const max = calcularValorMaximo(155, 72);
    expect(calcularParcela(max, 72)).toBeLessThanOrEqual(155);
    expect(calcularParcela(max + 0.01, 72)).toBeGreaterThan(155);
  });

  it("margem zero ou negativa resulta em zero", () => {
    expect(calcularValorMaximo(0, 72)).toBe(0);
    expect(calcularValorMaximo(-23.7, 72)).toBe(0);
  });
});

describe("simular", () => {
  it("caso da Dona Marlene: cabe", () => {
    const r = simular(marlene, 6000, 72);
    expect(r).toMatchObject({ parcela: 149.34, margemDisponivel: 155, cabe: true, valorMaximo: null });
  });

  it("quando não cabe, devolve o maior valor que caberia", () => {
    const r = simular(marlene, 10000, 72);
    expect(r.cabe).toBe(false);
    expect(r.valorMaximo).toBe(calcularValorMaximo(155, 72));
  });

  it("cliente com margem negativa nunca cabe e não tem valor máximo", () => {
    const r = simular(margemNegativa, 500, 84);
    expect(r.cabe).toBe(false);
    expect(r.valorMaximo).toBeNull();
    expect(r.observacao).toMatch(/sem margem/i);
  });
});
