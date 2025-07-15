import { RetoolRPC } from "retoolrpc";
import axios from "axios";
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

// Start dummy HTTP server to keep Render service alive
app.get("/", (req, res) => {
  res.send("Retool RPC Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const rpc = new RetoolRPC({
  apiToken: 'retool_01jzpzjmz7jkdtr3sc3emwzzac',
  host: 'https://zetaglobalcustomerengineeringintern.retool.com',
  resourceId: 'ff04848d-4718-4713-8c14-9a08d42517cd',
  environmentName: 'production',
  pollingIntervalMs: 1000,
  version: '0.0.1',
  logLevel: 'info',
});

rpc.register({
  name: 'getSegmentsWithApiKey',
  arguments: {
    accountId: {
      type: 'string',
      required: true,
      description: 'Zeta Account ID',
    },
    apiKey: {
      type: 'string',
      required: true,
      description: 'API Key for Basic authentication',
    },
  },
  implementation: async (args, context) => {
    const { accountId, apiKey } = args;

    const url = `https://phoenix.api.zetaglobal.net/v1/site_configs?account_id=${accountId}`;
    const username = 'api';
    const password = apiKey;
    const encodedAuth = Buffer.from(`${username}:${password}`).toString('base64');

    try {
      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${encodedAuth}`,
        },
      });

      console.log("Data received:", response.data);
      return {
        success: true,
        accountId,
        data: response.data,
      };
    } catch (error) {
      console.error("API call failed:", error);
      return {
        success: false,
        message: error.message,
        status: error.response?.status || 500,
        error: error.response?.data || {},
      };
    }
  },
});

rpc.listen();
