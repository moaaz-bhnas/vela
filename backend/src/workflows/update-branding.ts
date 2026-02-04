import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { BRANDING_MODULE } from "../modules/branding";
import BrandingModuleService from "../modules/branding/service";
import type { PostAdminUpdateBrandingType } from "../api/admin/branding/validators";

type StepInput = PostAdminUpdateBrandingType;

const updateBrandingStep = createStep(
  "update-branding-step",
  async function updateBrandingHandler(
    input: StepInput,
    { container }
  ): Promise<
    StepResponse<{
      branding: Awaited<ReturnType<BrandingModuleService["updateConfig"]>>;
    }>
  > {
    const brandingService: BrandingModuleService =
      container.resolve(BRANDING_MODULE);
    const updatedConfig = await brandingService.updateConfig(input);
    return new StepResponse({ branding: updatedConfig });
  }
);

type WorkflowInput = StepInput;

export const updateBrandingWorkflow = createWorkflow(
  "update-branding",
  function updateBranding(input: WorkflowInput) {
    const result = updateBrandingStep(input);
    return new WorkflowResponse(result);
  }
);
