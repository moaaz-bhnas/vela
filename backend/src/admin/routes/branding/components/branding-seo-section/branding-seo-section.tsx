import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig } from "../../../../lib/types";

type BrandingSeoSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingSeoSection = ({
  branding,
}: BrandingSeoSectionProps) => {
  const { t } = useTranslation();
  const seoDefaults = branding?.seo_defaults ?? undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("branding.sections.seo.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("branding.sections.seo.description")}
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t("common.actions.edit"),
                  to: "?edit=seo",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("branding.fields.siteTagline")}
        </Text>
        <Text size="small" leading="compact">
          {seoDefaults?.site_tagline || t("common.states.none")}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("branding.fields.metaDescriptionTemplate")}
        </Text>
        <Text size="small" leading="compact" className="whitespace-pre-line">
          {seoDefaults?.meta_description_template || t("common.states.none")}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("branding.sections.seo.defaultOgImage")}
        </Text>
        {seoDefaults?.default_og_image_url ? (
          <div className="flex items-center gap-x-3">
            <div className="bg-ui-bg-component flex h-10 w-16 items-center justify-center overflow-hidden rounded-md border">
              <img
                src={seoDefaults.default_og_image_url}
                alt={t("branding.sections.seo.defaultOgImage")}
                className="h-full w-full object-cover"
              />
            </div>
            <Text size="xsmall" leading="compact" className="text-ui-fg-muted truncate max-w-[200px]">
              {seoDefaults.default_og_image_url}
            </Text>
          </div>
        ) : (
          <Text size="small" leading="compact">
            {t("common.states.none")}
          </Text>
        )}
      </div>
    </Container>
  );
};


