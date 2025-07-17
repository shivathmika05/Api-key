import { RetoolRPC } from "retoolrpc";
import axios from "axios";
import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;

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

// ✅ 1st endpoint — Gets BME Auth Key
rpc.register({
  name: 'getSegmentsWithApiKey',
  arguments: {
    accountId: {
      type: 'string',
      required: true,
      description: 'Zeta Account ID',
    },
  },
  implementation: async ({ accountId }) => {
    const url = `https://phoenix.api.zetaglobal.net/v1/site_configs?account_id=${accountId}`;
    const encodedAuth = Buffer.from(`api:5bc21b0483dc2722f99f3abdf3aa8bdd`).toString("base64");

    try {
      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${encodedAuth}`,
        },
      });

      return {
        success: true,
        accountId,
        bmeAuthKey: response.data?.bme_auth_key,
        siteConfig: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.response?.status || 500,
        error: error.response?.data || {},
      };
    }
  },
});

// ✅ 2nd endpoint — Uses API key to get site config, extract auth, then fetch segments
rpc.register({
  name: 'getSegmentMetadataFromBME',
  arguments: {
    apiKey: {
      type: 'string',
      required: true,
      description: 'API key to use for segment metadata lookup',
    },
  },
  implementation: async ({ apiKey }) => {
    const siteConfigUrl = `https://phoenix.api.zetaglobal.net/v1/segments`;
    const dynamicAuth = Buffer.from(`api:${apiKey}`).toString("base64");

    // try {
      const siteConfigResp = await axios.get(siteConfigUrl, {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${dynamicAuth}`,
        },
      });

    return siteConfigResp.data
  },
});

rpc.listen();
