import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let _handler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  if (!_handler) {
    await registerRoutes(app);
    _handler = serverless(app);
  }
  return _handler;
}

export const handler = async (event: any, context: any) => {
  const fn = await getHandler();
  return fn(event, context);
};
