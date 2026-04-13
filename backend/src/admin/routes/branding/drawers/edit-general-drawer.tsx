import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, Input, Textarea, toast, Drawer } from "@medusajs/ui";
import { Spinner } from "@medusajs/icons";
import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse } from "../../../lib/types";
import { Form } from "../common/form";

const EditGeneralSchema = z.object({
  site_title: z.string().optional(),
  copyright_text: z.string().optional(),
});

type EditGeneralFormValues = z.infer<typeof EditGeneralSchema>;

export const EditGeneralDrawer = ({ open }: { open: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<BrandingResponse>({
    queryKey: ["branding"],
    queryFn: brandingFetcher,
    staleTime: 30_000,
  });

  const form = useForm<EditGeneralFormValues>({
    defaultValues: {
      site_title: "",
      copyright_text: "",
    },
    resolver: zodResolver(EditGeneralSchema),
  });

  const { reset } = form;
  const wasOpenRef = useRef(false);
  useEffect(function syncFormOnOpen() {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (justOpened && data?.branding) {
      reset({
        site_title: data.branding.site_title || "",
        copyright_text: data.branding.copyright_text || "",
      });
    }
  }, [open, data, reset]);

  const submitMutation = useMutation({
    mutationFn: (values: EditGeneralFormValues) =>
      sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast.success(t("branding.toasts.generalUpdated"));
      navigate("/branding", { replace: true });
    },
    onError: (error: any) => {
      toast.error(error.message || t("branding.toasts.generalUpdateFailed"));
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

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>{t("branding.drawers.editGeneral")}</Heading>
        </Drawer.Header>
        {isLoading ? (
          <Drawer.Body>
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          </Drawer.Body>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
                <Form.Field
                  control={form.control}
                  name="site_title"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>{t("branding.fields.siteTitle")}</Form.Label>
                      <Form.Control>
                        <Input placeholder={t("branding.placeholders.siteTitle")} {...field} />
                      </Form.Control>
                      <Form.Hint>{t("branding.hints.siteTitle")}</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="copyright_text"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>{t("branding.fields.copyrightText")}</Form.Label>
                      <Form.Control>
                        <Textarea
                          placeholder={t("branding.placeholders.copyrightText")}
                          {...field}
                        />
                      </Form.Control>
                      <Form.Hint>{t("branding.hints.copyrightText")}</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
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
