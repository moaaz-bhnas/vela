import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { IApiKeyModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

// This route is intentionally public — it exposes only the publishable key
// (safe to share with browsers/storefronts) filtered by title.
export const AUTHENTICATE = false;

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const apiKeyModuleService: IApiKeyModuleService =
      req.scope.resolve(Modules.API_KEY);

    // Filter server-side to avoid listing all API keys
    const apiKeys = await apiKeyModuleService.listApiKeys({
      title: "Webshop",
      type: "publishable",
    });

    if (!apiKeys.length) {
      res.json({});
    } else {
      res.json({ publishableApiKey: apiKeys[0].token });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};