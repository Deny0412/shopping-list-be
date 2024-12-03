import { createServer } from "http";

export const createTestServer = (handler) => {
  return createServer(async (req, res) => {
    const response = await handler(req);
    res.writeHead(response.status || 200, Object.fromEntries(response.headers));
    res.end(JSON.stringify(response.body || {}));
  });
};
