import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Heading,
  Input,
  Textarea,
  toast,
  Drawer,
  Text,
} from "@medusajs/ui";
import { Spinner } from "@medusajs/icons";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { sdk, brandingFetcher } from "../../../lib/sdk";
import { BrandingResponse } from "../../../lib/types";
import { Form } from "../common/form";
import {
  FileUpload,
  FileType,
  RejectedFile,
} from "../../../components/common/file-upload";

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const EditSeoSchema = z.object({
  site_tagline: z.string().optional(),
  meta_description_template: z.string().optional(),
  default_og_image_url: z.string().url().optional().or(z.literal("")),
});

type EditSeoFormValues = z.infer<typeof EditSeoSchema>;

export const EditSeoDrawer = ({ open }: { open: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFile, setUploadedFile] = useState<FileType | null>(null);

  const { data, isLoading } = useQuery<BrandingResponse>({
    queryKey: ["branding"],
    queryFn: brandingFetcher,
    staleTime: 30_000,
  });
  const seoDefaults = data?.branding?.seo_defaults ?? undefined;

  const form = useForm<EditSeoFormValues>({
    defaultValues: {
      site_tagline: "",
      meta_description_template: "",
      default_og_image_url: "",
    },
    resolver: zodResolver(EditSeoSchema),
  });

  // Clear staged file when the drawer closes
  useEffect(function clearFileOnClose() {
    if (!open) {
      setUploadedFile((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return null;
      });
    }
  }, [open]);

  const { reset } = form;
  const wasOpenRef = useRef(false);
  useEffect(function syncFormOnOpen() {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened) return;
    if (seoDefaults) {
      reset({
        site_tagline: seoDefaults.site_tagline || "",
        meta_description_template: seoDefaults.meta_description_template || "",
        default_og_image_url: seoDefaults.default_og_image_url || "",
      });
    } else {
      reset({ site_tagline: "", meta_description_template: "", default_og_image_url: "" });
    }
  }, [open, seoDefaults, reset]);

  const submitMutation = useMutation({
    mutationFn: async ({
      values,
      file,
    }: {
      values: EditSeoFormValues;
      file: FileType | null;
    }) => {
      let ogImageUrl = values.default_og_image_url;
      if (file?.file) {
        const { files } = await sdk.admin.upload.create({ files: [file.file] });
        ogImageUrl = files[0]?.url || values.default_og_image_url;
      }
      const hasContent = values.site_tagline || values.meta_description_template || ogImageUrl;
      return sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: {
          seo_defaults: hasContent
            ? {
                site_tagline: values.site_tagline || undefined,
                meta_description_template: values.meta_description_template || undefined,
                default_og_image_url: ogImageUrl || undefined,
              }
            : null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast.success(t("branding.toasts.seoUpdated"));
      navigate("/branding", { replace: true });
    },
    onError: (error: any) => {
      toast.error(error.message || t("branding.toasts.seoUpdateFailed"));
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !submitMutation.isPending) {
      navigate("/branding", { replace: true });
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    submitMutation.mutate({ values, file: uploadedFile });
  });

  const handleFileUpload = (file: FileType) => {
    setUploadedFile(file);
  };

  const handleFileRemove = () => {
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(null);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>{t("branding.drawers.editSeo")}</Heading>
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
              <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
                <Form.Field
                  control={form.control}
                  name="site_tagline"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>{t("branding.fields.siteTagline")}</Form.Label>
                      <Form.Control>
                        <Input
                          placeholder={t("branding.placeholders.siteTagline")}
                          {...field}
                        />
                      </Form.Control>
                      <Form.Hint>{t("branding.hints.siteTagline")}</Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="meta_description_template"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>{t("branding.fields.metaDescriptionTemplate")}</Form.Label>
                      <Form.Control>
                        <Textarea
                          placeholder={t("branding.placeholders.metaDescriptionTemplate")}
                          rows={4}
                          {...field}
                        />
                      </Form.Control>
                      <Form.Hint>
                        {t("branding.hints.metaDescriptionTemplate")}
                      </Form.Hint>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="default_og_image_url"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label optional>{t("branding.fields.defaultOgImageUrl")}</Form.Label>
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-x-2 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                            <img
                              src={uploadedFile.url}
                              alt={t("branding.fields.image")}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <Text size="small" className="text-ui-fg-base truncate">
                                {uploadedFile.file.name}
                              </Text>
                              <Text size="xsmall" className="text-ui-fg-muted">
                                {(uploadedFile.file.size / 1024).toFixed(2)} KB
                              </Text>
                            </div>
                            <Button
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={handleFileRemove}
                            >
                              {t("common.actions.remove")}
                            </Button>
                          </div>
                          <Form.Hint>{t("common.fileUpload.uploadedFileReplacesUrl")}</Form.Hint>
                        </div>
                      ) : (
                        <>
                          <Form.Control>
                            <Input
                              placeholder={t("branding.placeholders.ogImageUrl")}
                              {...field}
                            />
                          </Form.Control>
                          <Form.Hint>
                            {t("branding.hints.ogImage")}
                          </Form.Hint>
                        </>
                      )}
                      <Form.ErrorMessage />
                    </Form.Item>
                  )}
                />
                {!uploadedFile && (
                  <FileUpload
                    label={t("branding.fields.defaultOgImageUrl")}
                    hint={t("common.fileUpload.defaultHint")}
                    formats={SUPPORTED_IMAGE_FORMATS}
                    multiple={false}
                    maxFileSize={5 * 1024 * 1024}
                    onUploaded={(files, rejectedFiles) => {
                      if (rejectedFiles && rejectedFiles.length > 0) {
                        const sizeRejected = rejectedFiles.filter(
                          (f: RejectedFile) => f.reason === "size"
                        );
                        const formatRejected = rejectedFiles.filter(
                          (f: RejectedFile) => f.reason === "format"
                        );
                        if (sizeRejected.length > 0) {
                          const file = sizeRejected[0];
                          const fileSizeMB = (file.file.size / (1024 * 1024)).toFixed(2);
                          toast.error(
                            `File "${file.file.name}" is too large (${fileSizeMB} MB). Maximum file size is 5 MB.`
                          );
                        }
                        if (formatRejected.length > 0) {
                          const file = formatRejected[0];
                          toast.error(
                            `File "${file.file.name}" is not a supported image format.`
                          );
                        }
                        return;
                      }
                      if (files.length > 0) {
                        handleFileUpload(files[0]);
                      }
                    }}
                  />
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
