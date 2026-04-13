import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig } from "../../../../lib/types";

type BrandingLogosSectionProps = {
  branding?: BrandingConfig;
};

const LogoDisplay = ({
  logo,
  label,
  fallbackText,
}: {
  logo?: { url: string; alt: string; width: number; height: number };
  label: string;
  fallbackText: string;
}) => (
  <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
    <Text size="small" leading="compact" weight="plus">
      {label}
    </Text>
    {logo?.url ? (
      <div className="flex items-center gap-x-3">
        <div className="bg-ui-bg-component flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border">
          <img
            src={logo.url}
            alt={logo.alt || label}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <Text size="small" leading="compact">
            {logo.width}x{logo.height}px
          </Text>
          <Text size="xsmall" leading="compact" className="text-ui-fg-muted">
            {logo.alt || fallbackText}
          </Text>
        </div>
      </div>
    ) : (
      <Text size="small" leading="compact">
        {fallbackText}
      </Text>
    )}
  </div>
);

export const BrandingLogosSection = ({
  branding,
}: BrandingLogosSectionProps) => {
  const { t } = useTranslation();
  const logos = branding?.logos ?? undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("branding.sections.logos.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("branding.sections.logos.description")}
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t("common.actions.edit"),
                  to: "?edit=logos",
                },
              ],
            },
          ]}
        />
      </div>
      <LogoDisplay
        logo={logos?.main}
        label={t("branding.sections.logos.main")}
        fallbackText={t("common.states.none")}
      />
      <LogoDisplay
        logo={logos?.footer}
        label={t("branding.sections.logos.footer")}
        fallbackText={t("common.states.none")}
      />
      <LogoDisplay
        logo={logos?.favicon}
        label={t("branding.sections.logos.favicon")}
        fallbackText={t("common.states.none")}
      />
    </Container>
  );
};
