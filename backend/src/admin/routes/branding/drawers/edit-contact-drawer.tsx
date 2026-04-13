import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, Input, Textarea, toast, Drawer } from "@medusajs/ui";
import { Spinner } from "@medusajs/icons";
import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { phone } from "phone";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse } from "../../../lib/types";
import { Form } from "../common/form";

const EditContactSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        const validation = phone(val);
        return validation.isValid;
      },
      {
        message: "Please enter a valid international phone number (e.g., +1-555-123-4567)",
      }
    ),
  address: z.string().optional(),
});

type EditContactFormValues = z.infer<typeof EditContactSchema>;

export const EditContactDrawer = ({ open }: { open: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<BrandingResponse>({
    queryKey: ["branding"],
    queryFn: brandingFetcher,
    staleTime: 30_000,
  });
  const contactInfo = data?.branding?.contact_info ?? undefined;

  const form = useForm<EditContactFormValues>({
    defaultValues: {
      email: "",
      phone: "",
      address: "",
    },
    resolver: zodResolver(EditContactSchema),
  });

  const { reset } = form;
  const wasOpenRef = useRef(false);
  useEffect(function syncFormOnOpen() {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened) return;
    if (contactInfo) {
      reset({
        email: contactInfo.email || "",
        phone: contactInfo.phone || "",
        address: contactInfo.address || "",
      });
    } else {
      reset({ email: "", phone: "", address: "" });
    }
  }, [open, contactInfo, reset]);

  const submitMutation = useMutation({
    mutationFn: (values: EditContactFormValues) => {
      const hasContent = values.email || values.phone || values.address;
      return sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: {
          contact_info: hasContent
            ? {
                email: values.email || undefined,
                phone: values.phone || undefined,
                address: values.address || undefined,
              }
            : null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast.success(t("branding.toasts.contactUpdated"));
      navigate("/branding", { replace: true });
    },
    onError: (error: any) => {
      toast.error(error.message || t("branding.toasts.contactUpdateFailed"));
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
          <Heading>{t("branding.drawers.editContact")}</Heading>
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
                  name="email"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>{t("branding.fields.email")}</Form.Label>
                      <Form.Control>
                        <Input type="email" placeholder={t("branding.placeholders.email")} {...field} />
                      </Form.Control>
                      <Form.Hint>{t("branding.hints.email")}</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>{t("branding.fields.phone")}</Form.Label>
                      <Form.Control>
                        <Input placeholder={t("branding.placeholders.phone")} {...field} />
                      </Form.Control>
                      <Form.Hint>{t("branding.hints.phone")}</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>{t("branding.fields.address")}</Form.Label>
                      <Form.Control>
                        <Textarea placeholder={t("branding.placeholders.address")} {...field} />
                      </Form.Control>
                      <Form.Hint>{t("branding.hints.address")}</Form.Hint>
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
