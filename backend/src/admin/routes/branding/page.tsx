import { defineRouteConfig } from "@medusajs/admin-sdk";
import { BuildingStorefront } from "@medusajs/icons";
import { Container } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { brandingFetcher } from "../../lib/sdk";
import { BrandingGeneralSection } from "./components/branding-general-section";
import { BrandingLogosSection } from "./components/branding-logos-section";
import { BrandingContactSection } from "./components/branding-contact-section";
import { BrandingSocialSection } from "./components/branding-social-section";
import { BrandingSeoSection } from "./components/branding-seo-section";
import { BrandingCarouselSection } from "./components/branding-carousel-section";

import {
  EditGeneralDrawer,
  EditLogosDrawer,
  EditContactDrawer,
  EditSocialDrawer,
  EditSeoDrawer,
  EditCarouselDrawer,
} from "./drawers";

const SkeletonSection = () => (
  <Container className="divide-y p-0">
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex flex-col gap-y-2">
        <div className="bg-ui-bg-component h-4 w-32 animate-pulse rounded" />
        <div className="bg-ui-bg-component h-3 w-48 animate-pulse rounded" />
      </div>
    </div>
    <div className="px-6 py-4">
      <div className="bg-ui-bg-component h-3 w-64 animate-pulse rounded" />
    </div>
  </Container>
);

const BrandingPage = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["branding"],
    queryFn: brandingFetcher,
    staleTime: 30_000,
  });
  const [searchParams] = useSearchParams();

  const editSection = searchParams.get("edit");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-3">
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
      </div>
    );
  }

  if (error) {
    throw error;
  }

  const branding = data?.branding;

  return (
    <div className="flex flex-col gap-y-3">
      <BrandingGeneralSection branding={branding} />
      <BrandingLogosSection branding={branding} />
      <BrandingContactSection branding={branding} />
      <BrandingSocialSection branding={branding} />
      <BrandingSeoSection branding={branding} />
      <BrandingCarouselSection branding={branding} />

      <EditGeneralDrawer open={editSection === "general"} />
      <EditLogosDrawer open={editSection === "logos"} />
      <EditContactDrawer open={editSection === "contact"} />
      <EditSocialDrawer open={editSection === "social"} />
      <EditSeoDrawer open={editSection === "seo"} />
      <EditCarouselDrawer open={editSection === "carousel"} />
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Branding",
  icon: BuildingStorefront,
});

export default BrandingPage;
