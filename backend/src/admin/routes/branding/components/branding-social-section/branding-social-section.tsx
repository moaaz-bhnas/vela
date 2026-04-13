import { PencilSquare } from "@medusajs/icons";
import { Badge, Container, Heading, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig } from "../../../../lib/types";

type BrandingSocialSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingSocialSection = ({
  branding,
}: BrandingSocialSectionProps) => {
  const { t } = useTranslation();
  const socialLinks = branding?.social_links ?? undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("branding.sections.social.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("branding.sections.social.description")}
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t("common.actions.edit"),
                  to: "?edit=social",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="px-6 py-4">
        {socialLinks && socialLinks.length > 0 ? (
          <div className="flex flex-col gap-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-x-3">
                <Badge size="small" className="capitalize">
                  {link.platform}
                </Badge>
                <Text size="small" leading="compact" className="text-ui-fg-subtle truncate">
                  {link.url}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {t("branding.sections.social.empty")}
          </Text>
        )}
      </div>
    </Container>
  );
};


