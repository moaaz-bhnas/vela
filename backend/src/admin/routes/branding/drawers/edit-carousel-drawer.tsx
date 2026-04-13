import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Heading,
  Input,
  Textarea,
  IconButton,
  toast,
  Drawer,
  Text,
} from "@medusajs/ui";
import { Plus, Trash, ArrowUpMini, ArrowDownMini, Spinner } from "@medusajs/icons";
import { useForm, useFieldArray } from "react-hook-form";
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

const CarouselSlideSchema = z.object({
  id: z.string().optional(), // DB id — present for existing slides, absent for new ones
  image_url: z.string().url().optional().or(z.literal("")),
  title: z.string().optional(),
  description: z.string().optional(),
  link_url: z.string().url().optional().or(z.literal("")),
  link_text: z.string().optional(),
  sort_order: z.coerce.number().optional(),
});

const EditCarouselSchema = z.object({
  slides: z.array(CarouselSlideSchema),
});

type EditCarouselFormValues = z.infer<typeof EditCarouselSchema>;

export const EditCarouselDrawer = ({ open }: { open: boolean }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<Map<number, FileType>>(new Map());

  const { data, isLoading } = useQuery<BrandingResponse>({
    queryKey: ["branding"],
    queryFn: brandingFetcher,
    staleTime: 30_000,
  });
  const existingSlides = data?.branding?.slides ?? undefined;

  const form = useForm<EditCarouselFormValues>({
    defaultValues: {
      slides: [],
    },
    resolver: zodResolver(EditCarouselSchema),
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "slides",
  });

  // Clear staged files when the drawer closes
  useEffect(function clearFilesOnClose() {
    if (!open) {
      setUploadedFiles((prev) => {
        prev.forEach((file) => {
          if (file?.url) URL.revokeObjectURL(file.url);
        });
        return new Map();
      });
    }
  }, [open]);

  const { reset } = form;
  const wasOpenRef = useRef(false);
  useEffect(function syncFormOnOpen() {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (!justOpened) return;
    if (existingSlides && existingSlides.length > 0) {
      reset({
        slides: existingSlides.map((slide, index) => ({
          id: slide.id,
          image_url: slide.image_url || "",
          title: slide.title || "",
          description: slide.description || "",
          link_url: slide.link_url || "",
          link_text: slide.link_text || "",
          sort_order: slide.sort_order ?? index + 1,
        })),
      });
    } else {
      reset({ slides: [] });
    }
  }, [open, existingSlides, reset]);

  const submitMutation = useMutation({
    mutationFn: async ({
      values,
      files,
    }: {
      values: EditCarouselFormValues;
      files: Map<number, FileType>;
    }) => {
      const filesToUpload = Array.from(files.values()).map((f) => f.file);
      let uploadedUrls: string[] = [];
      if (filesToUpload.length > 0) {
        const { files: uploaded } = await sdk.admin.upload.create({ files: filesToUpload });
        uploadedUrls = uploaded.map((f) => f.url);
      }

      const fileUrlMap = new Map<number, string>();
      let urlIndex = 0;
      files.forEach((_file, slideIndex) => {
        fileUrlMap.set(slideIndex, uploadedUrls[urlIndex++]);
      });

      const slides = values.slides
        .map((slide, index) => {
          const imageUrl = fileUrlMap.get(index) || slide.image_url || undefined;
          return {
            id: slide.id, // preserve DB id so Translation Module records survive
            image_url: imageUrl,
            title: slide.title || undefined,
            description: slide.description || undefined,
            link_url: slide.link_url || undefined,
            link_text: slide.link_text || undefined,
            sort_order: index + 1,
          };
        })
        .filter((slide) => slide.image_url || slide.title);

      return sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: { slides: slides.length > 0 ? slides : [] },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast.success(t("branding.toasts.carouselUpdated"));
      navigate("/branding", { replace: true });
    },
    onError: (error: any) => {
      toast.error(error.message || t("branding.toasts.carouselUpdateFailed"));
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !submitMutation.isPending) {
      navigate("/branding", { replace: true });
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    submitMutation.mutate({ values, files: uploadedFiles });
  });

  const handleFileUpload = (index: number) => (file: FileType) => {
    setUploadedFiles((prev) => {
      const newMap = new Map(prev);
      const oldFile = newMap.get(index);
      if (oldFile?.url) {
        URL.revokeObjectURL(oldFile.url);
      }
      newMap.set(index, file);
      return newMap;
    });
  };

  const handleFileRemove = (index: number) => () => {
    setUploadedFiles((prev) => {
      const newMap = new Map(prev);
      const file = newMap.get(index);
      if (file?.url) {
        URL.revokeObjectURL(file.url);
      }
      newMap.delete(index);
      return newMap;
    });
  };

  const handleRemove = (index: number) => {
    handleFileRemove(index)();
    remove(index);
  };

  const handleAddSlide = () => {
    append({
      image_url: "",
      title: "",
      description: "",
      link_url: "",
      link_text: "",
      sort_order: fields.length + 1,
    });
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      const fileAtCurrent = uploadedFiles.get(index);
      const fileAtNext = uploadedFiles.get(index + 1);
      setUploadedFiles((prev) => {
        const newMap = new Map(prev);
        if (fileAtCurrent) { newMap.set(index + 1, fileAtCurrent); } else { newMap.delete(index + 1); }
        if (fileAtNext) { newMap.set(index, fileAtNext); } else { newMap.delete(index); }
        return newMap;
      });
      move(index, index + 1);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const fileAtCurrent = uploadedFiles.get(index);
      const fileAtPrevious = uploadedFiles.get(index - 1);
      setUploadedFiles((prev) => {
        const newMap = new Map(prev);
        if (fileAtCurrent) { newMap.set(index - 1, fileAtCurrent); } else { newMap.delete(index - 1); }
        if (fileAtPrevious) { newMap.set(index, fileAtPrevious); } else { newMap.delete(index); }
        return newMap;
      });
      move(index, index - 1);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>{t("branding.drawers.editCarousel")}</Heading>
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
                      {t("branding.sections.carousel.empty")}
                    </Text>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleAddSlide}
                    >
                      <Plus />
                      {t("branding.sections.carousel.addSlide")}
                    </Button>
                  </div>
                ) : (
                  <>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-ui-bg-subtle rounded-lg border p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle">
                            {t("branding.sections.carousel.slide", { number: index + 1 })}
                          </Text>
                          <div className="flex items-center gap-x-1">
                            <IconButton
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                            >
                              <ArrowUpMini className="text-ui-fg-subtle" />
                            </IconButton>
                            <IconButton
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === fields.length - 1}
                            >
                              <ArrowDownMini className="text-ui-fg-subtle" />
                            </IconButton>
                            <IconButton
                              type="button"
                              variant="transparent"
                              size="small"
                              onClick={() => handleRemove(index)}
                            >
                              <Trash className="text-ui-fg-subtle" />
                            </IconButton>
                          </div>
                        </div>
                        <div className="flex flex-col gap-y-4">
                          <Form.Field
                            control={form.control}
                            name={`slides.${index}.image_url`}
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label optional>{t("branding.fields.imageUrl")}</Form.Label>
                                {uploadedFiles.has(index) ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-x-2 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                                      <img
                                        src={uploadedFiles.get(index)!.url}
                                        alt={t("branding.fields.image")}
                                        className="w-16 h-16 object-cover rounded"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <Text size="small" className="text-ui-fg-base truncate">
                                          {uploadedFiles.get(index)!.file.name}
                                        </Text>
                                        <Text size="xsmall" className="text-ui-fg-muted">
                                          {(uploadedFiles.get(index)!.file.size / 1024).toFixed(2)} KB
                                        </Text>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="transparent"
                                        size="small"
                                        onClick={handleFileRemove(index)}
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
                                        placeholder={t("branding.placeholders.slideImageUrl")}
                                        {...field}
                                      />
                                    </Form.Control>
                                    <Form.Hint>{t("common.fileUpload.orUploadBelow")}</Form.Hint>
                                  </>
                                )}
                                <Form.ErrorMessage />
                              </Form.Item>
                            )}
                          />
                          {!uploadedFiles.has(index) && (
                            <FileUpload
                              label={t("common.actions.uploadImage")}
                              hint={t("common.fileUpload.defaultHint")}
                              formats={SUPPORTED_IMAGE_FORMATS}
                              multiple={false}
                              maxFileSize={10 * 1024 * 1024}
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
                                      `File "${file.file.name}" is too large (${fileSizeMB} MB). Maximum file size is 10 MB.`
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
                                  handleFileUpload(index)(files[0]);
                                }
                              }}
                            />
                          )}
                          <Form.Field
                            control={form.control}
                            name={`slides.${index}.title`}
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label optional>{t("branding.fields.title")}</Form.Label>
                                <Form.Control>
                                  <Input placeholder={t("branding.placeholders.slideTitle")} {...field} />
                                </Form.Control>
                                <Form.ErrorMessage />
                              </Form.Item>
                            )}
                          />
                          <Form.Field
                            control={form.control}
                            name={`slides.${index}.description`}
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label optional>{t("branding.fields.description")}</Form.Label>
                                <Form.Control>
                                  <Textarea placeholder={t("branding.placeholders.slideDescription")} rows={2} {...field} />
                                </Form.Control>
                                <Form.ErrorMessage />
                              </Form.Item>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Form.Field
                              control={form.control}
                              name={`slides.${index}.link_url`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label optional>{t("branding.fields.linkUrl")}</Form.Label>
                                  <Form.Control>
                                    <Input placeholder={t("branding.placeholders.slideLinkUrl")} {...field} />
                                  </Form.Control>
                                  <Form.ErrorMessage />
                                </Form.Item>
                              )}
                            />
                            <Form.Field
                              control={form.control}
                              name={`slides.${index}.link_text`}
                              render={({ field }) => (
                                <Form.Item>
                                  <Form.Label optional>{t("branding.fields.linkText")}</Form.Label>
                                  <Form.Control>
                                    <Input placeholder={t("branding.placeholders.slideLinkText")} {...field} />
                                  </Form.Control>
                                  <Form.ErrorMessage />
                                </Form.Item>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleAddSlide}
                      className="self-start shrink-0"
                    >
                      <Plus />
                      {t("branding.sections.carousel.addSlide")}
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
