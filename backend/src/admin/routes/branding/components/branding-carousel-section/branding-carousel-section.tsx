import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig } from "../../../../lib/types";

type BrandingCarouselSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingCarouselSection = ({
  branding,
}: BrandingCarouselSectionProps) => {
  const { t } = useTranslation();
  const carouselSlides = branding?.carousel_slides ?? undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("branding.sections.carousel.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("branding.sections.carousel.description")}
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t("common.actions.edit"),
                  to: "?edit=carousel",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="px-6 py-4">
        {carouselSlides && carouselSlides.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {carouselSlides
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((slide, index) => (
                <div
                  key={index}
                  className="bg-ui-bg-subtle overflow-hidden rounded-lg border"
                >
                  {slide.image_url ? (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={slide.image_url}
                        alt={slide.title || t("branding.sections.carousel.slide", { number: index + 1 })}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-ui-bg-component aspect-video flex items-center justify-center">
                      <Text size="small" className="text-ui-fg-muted">
                        {t("common.states.noImage")}
                      </Text>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-x-2">
                      <Text size="xsmall" className="text-ui-fg-muted">
                        #{slide.order || index + 1}
                      </Text>
                      <Text size="small" weight="plus" className="truncate">
                        {slide.title || t("common.states.none")}
                      </Text>
                    </div>
                    {slide.description && (
                      <Text
                        size="xsmall"
                        className="text-ui-fg-subtle mt-1 line-clamp-2"
                      >
                        {slide.description}
                      </Text>
                    )}
                    {slide.link_url && (
                      <Text
                        size="xsmall"
                        className="text-ui-fg-interactive mt-2 truncate"
                      >
                        {slide.link_text || slide.link_url}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {t("branding.sections.carousel.empty")}
          </Text>
        )}
      </div>
    </Container>
  );
};
