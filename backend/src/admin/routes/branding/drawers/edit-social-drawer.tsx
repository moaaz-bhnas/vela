import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Heading,
  Input,
  IconButton,
  toast,
  Drawer,
  Select,
  Text,
} from "@medusajs/ui";
import { Plus, Trash, Spinner } from "@medusajs/icons";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse } from "../../../lib/types";
import { Form } from "../common/form";

const SOCIAL_PLATFORMS = [
  "facebook",
  "twitter",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "pinterest",
  "snapchat",
  "whatsapp",
  "telegram",
  "discord",
  "github",
  "dribbble",
  "behance",
  "medium",
  "reddit",
] as const;

const SocialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS, {
    required_error: "Platform is required",
  }),
  url: z.string().url("Must be a valid URL"),
});

const EditSocialSchema = z.object({
  social_links: z.array(SocialLinkSchema),
});

type EditSocialFormValues = z.infer<typeof EditSocialSchema>;

export const EditSocialDrawer = ({ open }: { open: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<BrandingResponse>({
    queryKey: ["branding"],
    queryFn: brandingFetcher,
    staleTime: 30_000,
  });
  const socialLinks = data?.branding?.social_links ?? undefined;

  const form = useForm<EditSocialFormValues>({
    defaultValues: {
      social_links: [],
    },
    resolver: zodResolver(EditSocialSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social_links",
  });

  const { reset } = form;
  const wasOpenRef = useRef(false);
  useEffect(function syncFormOnOpen() {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened) return;
    if (socialLinks && socialLinks.length > 0) {
      const validLinks = socialLinks
        .filter((link) => SOCIAL_PLATFORMS.includes(link.platform as any))
        .map((link) => ({
          platform: link.platform as (typeof SOCIAL_PLATFORMS)[number],
          url: link.url,
        }));
      reset({ social_links: validLinks.length > 0 ? validLinks : [] });
    } else {
      reset({ social_links: [] });
    }
  }, [open, socialLinks, reset]);

  const submitMutation = useMutation({
    mutationFn: (values: EditSocialFormValues) =>
      sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: {
          social_links: values.social_links.length > 0 ? values.social_links : null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast.success(t("branding.toasts.socialUpdated"));
      navigate("/branding", { replace: true });
    },
    onError: (error: any) => {
      toast.error(error.message || t("branding.toasts.socialUpdateFailed"));
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !submitMutation.isPending) {
      navigate("/branding", { replace: true });
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    submitMutation.mutate(values);
  });

  const watchedSocialLinks = form.watch("social_links");

  const handleAddLink = () => {
    const allSelectedPlatforms = watchedSocialLinks.map((link) => link?.platform);
    const availablePlatform = SOCIAL_PLATFORMS.find(
      (platform) => !allSelectedPlatforms.includes(platform)
    );
    append({
      platform: availablePlatform || SOCIAL_PLATFORMS[0],
      url: "",
    });
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>{t("branding.drawers.editSocial")}</Heading>
        </Drawer.Header>
        {isLoading ? (
          <Drawer.Body>
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          </Drawer.Body>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
                {fields.length === 0 ? (
                  <div className="text-ui-fg-subtle flex flex-col items-center justify-center py-8">
                    <Text size="small" leading="compact" className="mb-4">
                      {t("branding.sections.social.empty")}
                    </Text>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleAddLink}
                    >
                      <Plus />
                      {t("branding.sections.social.addLink")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {fields.map((field, index) => {
                      const allSelectedPlatforms = watchedSocialLinks.map((link) => link?.platform);
                      const availablePlatforms = SOCIAL_PLATFORMS.filter(
                        (platform) =>
                          !allSelectedPlatforms.includes(platform) ||
                          allSelectedPlatforms[index] === platform
                      );

                      return (
                        <div
                          key={field.id}
                          className="bg-ui-bg-subtle rounded-lg border p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
                              {t("branding.sections.social.link", { number: index + 1 })}
                            </Text>
                            <IconButton
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={() => remove(index)}
                            >
                              <Trash className="text-ui-fg-subtle" />
                            </IconButton>
                          </div>
                          <div className="flex flex-col gap-y-4">
                            <Form.Field
                              control={form.control}
                              name={`social_links.${index}.platform`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label>{t("branding.fields.platform")}</Form.Label>
                                  <Form.Control>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <Select.Trigger>
                                        <Select.Value placeholder={t("branding.sections.social.platformPlaceholder")} />
                                      </Select.Trigger>
                                      <Select.Content>
                                        {availablePlatforms.length === 0 ? (
                                          <Select.Item value="" disabled>
                                            {t("branding.sections.social.noPlatformsAvailable")}
                                          </Select.Item>
                                        ) : (
                                          availablePlatforms.map((platform) => (
                                            <Select.Item
                                              key={platform}
                                              value={platform}
                                            >
                                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                            </Select.Item>
                                          ))
                                        )}
                                      </Select.Content>
                                    </Select>
                                  </Form.Control>
                                  <Form.ErrorMessage />
                                </Form.Item>
                              )}
                            />
                            <Form.Field
                              control={form.control}
                              name={`social_links.${index}.url`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label>{t("branding.fields.url")}</Form.Label>
                                  <Form.Control>
                                    <Input
                                      placeholder={t("branding.placeholders.socialUrl")}
                                      {...field}
                                    />
                                  </Form.Control>
                                  <Form.ErrorMessage />
                                </Form.Item>
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleAddLink}
                      className="self-start shrink-0"
                    >
                      <Plus />
                      {t("branding.sections.social.addLink")}
                    </Button>
                  </>
                )}
              </Drawer.Body>
              <Drawer.Footer>
                <div className="flex items-center justify-end gap-x-2">
                  <Drawer.Close asChild>
                    <Button size="small" variant="secondary" disabled={submitMutation.isPending}>
                      {t("common.actions.cancel")}
                    </Button>
                  </Drawer.Close>
                  <Button size="small" type="submit" isLoading={submitMutation.isPending}>
                    {t("common.actions.save")}
                  </Button>
                </div>
              </Drawer.Footer>
            </form>
          </Form>
        )}
      </Drawer.Content>
    </Drawer>
  );
};
