import express from "express";
import { simulacoesRouter } from "./routes/simulacoes";

export function criarApp() {
  const app = express();
  app.use(express.json());
  app.use(simulacoesRouter);

  // JSON malformado no body cai aqui
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err?.type === "entity.parse.failed") {
      return res.status(400).json({ erro: "JSON inválido no corpo da requisição" });
    }
    return res.status(500).json({ erro: "Erro interno" });
  });

  return app;
}
