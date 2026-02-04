import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { BRANDING_MODULE } from "../modules/branding";
import BrandingModuleService from "../modules/branding/service";

const deleteBrandingStep = createStep(
  "delete-branding-step",
  async function deleteBrandingHandler(
    _input: Record<string, never>,
    { container }
  ): Promise<StepResponse<{ deleted: true }>> {
    const brandingService: BrandingModuleService =
      container.resolve(BRANDING_MODULE);
    await brandingService.deleteConfig();
    return new StepResponse({ deleted: true });
  }
);

export const deleteBrandingWorkflow = createWorkflow(
  "delete-branding",
  function deleteBranding() {
    const result = deleteBrandingStep({});
    return new WorkflowResponse(result);
  }
);
