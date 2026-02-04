import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { BRANDING_MODULE } from "../../../modules/branding";
import BrandingModuleService from "../../../modules/branding/service";
import { PostAdminUpdateBrandingType } from "./validators";
import { updateBrandingWorkflow } from "../../../workflows/update-branding";
import { deleteBrandingWorkflow } from "../../../workflows/delete-branding";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const brandingModuleService: BrandingModuleService =
    req.scope.resolve(BRANDING_MODULE);

  const config = await brandingModuleService.getConfig();

  if (!config) {
    return res.status(404).json({
      message: "Branding configuration not found",
    });
  }

  res.json({ branding: config });
};

export const POST = async (
  req: MedusaRequest<PostAdminUpdateBrandingType>,
  res: MedusaResponse
) => {
  const { result } = await updateBrandingWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.json({ branding: result.branding });
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  await deleteBrandingWorkflow(req.scope).run({
    input: {},
  });

  res.status(204).send();
};
