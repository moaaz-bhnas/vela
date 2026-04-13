import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, Input, toast, Drawer, Text } from "@medusajs/ui";
import { Spinner } from "@medusajs/icons";
import { useForm, Control } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  "image/svg+xml",
];

const LogoSchema = z.object({
  url: z.string().url().optional().or(z.literal("")),
  alt: z.string().optional(),
  width: z.coerce.number().positive().optional().or(z.literal("")),
  height: z.coerce.number().positive().optional().or(z.literal("")),
});

const EditLogosSchema = z.object({
  main: LogoSchema.optional(),
  footer: LogoSchema.optional(),
  favicon: LogoSchema.optional(),
});

type EditLogosFormValues = z.infer<typeof EditLogosSchema>;

type UploadedFiles = {
  main: FileType | null;
  footer: FileType | null;
  favicon: FileType | null;
};

const getRatioRecommendation = (
  prefix: "main" | "footer" | "favicon"
): string => {
  switch (prefix) {
    case "main":
    case "footer":
      return "Recommended aspect ratio: 4:1 or 3:1 (horizontal logo)";
    case "favicon":
      return "Recommended: 1:1 (square), ideally 32×32px or 64×64px";
    default:
      return "";
  }
};

const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
};

const LogoFields = ({
  prefix,
  label,
  control,
  uploadedFile,
  onFileUpload,
  onFileRemove,
}: {
  prefix: "main" | "footer" | "favicon";
  label: string;
  control: Control<EditLogosFormValues>;
  uploadedFile: FileType | null;
  onFileUpload: (file: FileType) => void;
  onFileRemove: () => void;
}) => (
  <div className="space-y-4">
    <Heading level="h3" className="text-ui-fg-base">
      {label}
    </Heading>
    <div className="space-y-4">
      <div>
        <Form.Field
          control={control}
          name={`${prefix}.url`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label optional>Image URL</Form.Label>
              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-x-2 p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                    <img
                      src={uploadedFile.url}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
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
                      onClick={onFileRemove}
                    >
                      Remove
                    </Button>
                  </div>
                  <Form.Hint>Uploaded file will replace URL input</Form.Hint>
                </div>
              ) : (
                <>
                  <Form.Control>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                    />
                  </Form.Control>
                  <Form.Hint>Or upload a file below</Form.Hint>
                </>
              )}
              <Form.ErrorMessage />
            </Form.Item>
          )}
        />
      </div>
      {!uploadedFile && (
        <div className="space-y-2">
          <FileUpload
            label="Upload Image"
            hint="Drag and drop an image here or click to upload"
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
                onFileUpload(files[0]);
              }
            }}
          />
          <Text size="xsmall" className="text-ui-fg-muted">
            {getRatioRecommendation(prefix)}
          </Text>
        </div>
      )}
      <div>
        <Form.Field
          control={control}
          name={`${prefix}.alt`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label optional>Alt Text</Form.Label>
              <Form.Control>
                <Input placeholder="Logo description" {...field} />
              </Form.Control>
              <Form.ErrorMessage />
            </Form.Item>
          )}
        />
      </div>
    </div>
  </div>
);

export const EditLogosDrawer = ({ open }: { open: boolean }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    main: null,
    footer: null,
    favicon: null,
  });

  const { data, isLoading } = useQuery<BrandingResponse>({
    queryKey: ["branding"],
    queryFn: brandingFetcher,
    staleTime: 30_000,
  });
  const logos = data?.branding?.logos ?? undefined;

  const form = useForm<EditLogosFormValues>({
    defaultValues: {
      main: { url: "", alt: "", width: "", height: "" },
      footer: { url: "", alt: "", width: "", height: "" },
      favicon: { url: "", alt: "", width: "", height: "" },
    },
    resolver: zodResolver(EditLogosSchema),
  });

  // Clear staged files when the drawer closes to prevent state leaking into the next open
  useEffect(function clearFilesOnClose() {
    if (!open) {
      setUploadedFiles((prev) => {
        if (prev.main?.url) URL.revokeObjectURL(prev.main.url);
        if (prev.footer?.url) URL.revokeObjectURL(prev.footer.url);
        if (prev.favicon?.url) URL.revokeObjectURL(prev.favicon.url);
        return { main: null, footer: null, favicon: null };
      });
    }
  }, [open]);

  const { reset } = form;
  const wasOpenRef = useRef(false);
  useEffect(function syncFormOnOpen() {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    if (justOpened && logos) {
      reset({
        main: {
          url: logos?.main?.url || "",
          alt: logos?.main?.alt || "",
          width: (logos?.main?.width?.toString() || "") as any,
          height: (logos?.main?.height?.toString() || "") as any,
        },
        footer: {
          url: logos?.footer?.url || "",
          alt: logos?.footer?.alt || "",
          width: (logos?.footer?.width?.toString() || "") as any,
          height: (logos?.footer?.height?.toString() || "") as any,
        },
        favicon: {
          url: logos?.favicon?.url || "",
          alt: logos?.favicon?.alt || "",
          width: (logos?.favicon?.width?.toString() || "") as any,
          height: (logos?.favicon?.height?.toString() || "") as any,
        },
      });
    }
  }, [open, logos, reset]);

  const submitMutation = useMutation({
    mutationFn: async ({
      values,
      files,
    }: {
      values: EditLogosFormValues;
      files: UploadedFiles;
    }) => {
      const filesToUpload = [
        files.main?.file,
        files.footer?.file,
        files.favicon?.file,
      ].filter((f): f is File => !!f);

      let uploadedUrls: string[] = [];
      if (filesToUpload.length > 0) {
        const { files: uploaded } = await sdk.admin.upload.create({
          files: filesToUpload,
        });
        uploadedUrls = uploaded.map((f) => f.url);
      }

      let urlIndex = 0;
      const getLogoUrl = (prefix: "main" | "footer" | "favicon") => {
        if (files[prefix]?.file) {
          return uploadedUrls[urlIndex++];
        }
        return values[prefix]?.url || "";
      };

      const cleanLogo = (logo: any, url: string) => {
        if (!url) return undefined;
        return {
          url,
          alt: logo?.alt || "",
          width: Number(logo?.width) || 0,
          height: Number(logo?.height) || 0,
        };
      };

      const updatedLogos = {
        main: cleanLogo(values.main, getLogoUrl("main")),
        footer: cleanLogo(values.footer, getLogoUrl("footer")),
        favicon: cleanLogo(values.favicon, getLogoUrl("favicon")),
      };
      const hasLogos = updatedLogos.main || updatedLogos.footer || updatedLogos.favicon;

      return sdk.client.fetch<BrandingResponse>("/admin/branding", {
        method: "POST",
        body: { logos: hasLogos ? updatedLogos : null },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast.success("Logos updated successfully");
      navigate("/branding", { replace: true });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update logos");
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

  const handleFileUpload =
    (prefix: "main" | "footer" | "favicon") => async (file: FileType) => {
      setUploadedFiles((prev) => ({ ...prev, [prefix]: file }));
      try {
        const { width, height } = await getImageDimensions(file.file);
        form.setValue(`${prefix}.width`, width.toString() as any);
        form.setValue(`${prefix}.height`, height.toString() as any);
      } catch {
        // Fail silently, dimensions will remain 0
      }
    };

  const handleFileRemove = (prefix: "main" | "footer" | "favicon") => () => {
    const file = uploadedFiles[prefix];
    if (file?.url) {
      URL.revokeObjectURL(file.url);
    }
    setUploadedFiles((prev) => ({ ...prev, [prefix]: null }));
    form.setValue(`${prefix}.width`, "" as any);
    form.setValue(`${prefix}.height`, "" as any);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Heading>Edit Logos</Heading>
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
                <LogoFields
                  prefix="main"
                  label="Main Logo"
                  control={form.control}
                  uploadedFile={uploadedFiles.main}
                  onFileUpload={handleFileUpload("main")}
                  onFileRemove={handleFileRemove("main")}
                />
                <div className="border-ui-border-base -mx-6 border-t" />
                <LogoFields
                  prefix="footer"
                  label="Footer Logo"
                  control={form.control}
                  uploadedFile={uploadedFiles.footer}
                  onFileUpload={handleFileUpload("footer")}
                  onFileRemove={handleFileRemove("footer")}
                />
                <div className="border-ui-border-base -mx-6 border-t" />
                <LogoFields
                  prefix="favicon"
                  label="Favicon"
                  control={form.control}
                  uploadedFile={uploadedFiles.favicon}
                  onFileUpload={handleFileUpload("favicon")}
                  onFileRemove={handleFileRemove("favicon")}
                />
              </Drawer.Body>
              <Drawer.Footer>
                <div className="flex items-center justify-end gap-x-2">
                  <Drawer.Close asChild>
                    <Button size="small" variant="secondary" disabled={submitMutation.isPending}>
                      Cancel
                    </Button>
                  </Drawer.Close>
                  <Button size="small" type="submit" isLoading={submitMutation.isPending}>
                    Save
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
