import request from "supertest";
import { describe, expect, it } from "vitest";
import { criarApp } from "../src/app";

const app = criarApp();

describe("POST /simulacoes", () => {
  it("aceita CPF com máscara e devolve a simulação", async () => {
    const res = await request(app).post("/simulacoes").send({ cpf: "111.111.111-11", valor: 6000, prazo: 72 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ parcela: 149.34, margemDisponivel: 155, cabe: true });
  });

  it("cliente inexistente → 404", async () => {
    const res = await request(app).post("/simulacoes").send({ cpf: "999.999.999-99", valor: 1000, prazo: 12 });
    expect(res.status).toBe(404);
  });

  it.each([
    [{ valor: 1000, prazo: 12 }, "cpf"],
    [{ cpf: "123", valor: 1000, prazo: 12 }, "cpf"],
    [{ cpf: "22222222222", valor: 499.99, prazo: 12 }, "valor"],
    [{ cpf: "22222222222", valor: "1000", prazo: 12 }, "valor"],
    [{ cpf: "22222222222", valor: 1000.555, prazo: 12 }, "valor"],
    [{ cpf: "22222222222", valor: 1000, prazo: 85 }, "prazo"],
    [{ cpf: "22222222222", valor: 1000, prazo: 0 }, "prazo"],
    [{ cpf: "22222222222", valor: 1000, prazo: 12.5 }, "prazo"],
  ])("entrada inválida %o → 400 apontando o campo %s", async (body, campo) => {
    const res = await request(app).post("/simulacoes").send(body);
    expect(res.status).toBe(400);
    expect(res.body.detalhes.map((d: any) => d.campo)).toContain(campo);
  });

  it("JSON malformado → 400", async () => {
    const res = await request(app)
      .post("/simulacoes")
      .set("Content-Type", "application/json")
      .send("{ cpf: ");
    expect(res.status).toBe(400);
  });
});
