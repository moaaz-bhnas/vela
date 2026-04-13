import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig } from "../../../../lib/types";

type BrandingGeneralSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingGeneralSection = ({
  branding,
}: BrandingGeneralSectionProps) => {
  const { t } = useTranslation();

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("branding.sections.general.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("branding.sections.general.description")}
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t("common.actions.edit"),
                  to: "?edit=general",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("branding.fields.siteTitle")}
        </Text>
        <Text size="small" leading="compact">
          {branding?.site_title || t("common.states.none")}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("branding.fields.copyrightText")}
        </Text>
        <Text size="small" leading="compact">
          {branding?.copyright_text || t("common.states.none")}
        </Text>
      </div>
    </Container>
  );
};

