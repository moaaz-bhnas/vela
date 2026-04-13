import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "../../common/action-menu";
import { BrandingConfig } from "../../../../lib/types";

type BrandingContactSectionProps = {
  branding?: BrandingConfig;
};

export const BrandingContactSection = ({
  branding,
}: BrandingContactSectionProps) => {
  const { t } = useTranslation();
  const contactInfo = branding?.contact_info ?? undefined;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("branding.sections.contact.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("branding.sections.contact.description")}
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: t("common.actions.edit"),
                  to: "?edit=contact",
                },
              ],
            },
          ]}
        />
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("branding.fields.email")}
        </Text>
        <Text size="small" leading="compact">
          {contactInfo?.email || t("common.states.none")}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("branding.fields.phone")}
        </Text>
        <Text size="small" leading="compact">
          {contactInfo?.phone || t("common.states.none")}
        </Text>
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("branding.fields.address")}
        </Text>
        <Text size="small" leading="compact" className="whitespace-pre-line">
          {contactInfo?.address || t("common.states.none")}
        </Text>
      </div>
    </Container>
  );
};


