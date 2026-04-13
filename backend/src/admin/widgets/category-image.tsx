import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps } from "@medusajs/framework/types";
import { Container, Text } from "@medusajs/ui";
import { PencilSquare } from "@medusajs/icons";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { ActionMenu } from "../routes/branding/common/action-menu";
import { EditCategoryImageDrawer } from "./edit-category-image-drawer";
import { categoryFetcher } from "../lib/queries";

type CategoryImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

type AdminProductCategory = {
  id: string;
  name: string;
  metadata?: {
    image?: CategoryImage;
  };
};

const CategoryImageWidget = ({
  data: category,
}: DetailWidgetProps<AdminProductCategory>) => {
  const [searchParams] = useSearchParams();

  // Fetch category with metadata
  const { data: queryResult, isLoading } = useQuery({
    queryKey: ["category", category.id],
    queryFn: () => categoryFetcher(category.id),
    staleTime: 30_000,
  });

  const categoryData =
    (queryResult?.product_category as AdminProductCategory) || category;
  const imageData = categoryData?.metadata?.image;

  if (isLoading) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col">
            <div className="bg-ui-bg-component h-4 w-32 animate-pulse rounded" />
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Text size="small" leading="compact" weight="plus">
              Category Image
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Upload an image for this category
            </Text>
          </div>
          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    icon: <PencilSquare />,
                    label: "Edit",
                    to: `?edit=category-image`,
                  },
                ],
              },
            ]}
          />
        </div>
        <div className="text-ui-fg-subtle grid grid-cols-2 px-6 py-4">
          <Text size="small" leading="compact" weight="plus">
            Image
          </Text>
          {imageData?.url ? (
            <div className="flex items-center gap-x-3">
              <div className="bg-ui-bg-component flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border">
                <img
                  src={imageData.url}
                  alt={imageData.alt || "Category image"}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <Text size="small" leading="compact">
                  {imageData.width}x{imageData.height}px
                </Text>
                <Text
                  size="xsmall"
                  leading="compact"
                  className="text-ui-fg-muted"
                >
                  {imageData.alt || "-"}
                </Text>
              </div>
            </div>
          ) : (
            <Text size="small" leading="compact">
              -
            </Text>
          )}
        </div>
      </Container>
      <EditCategoryImageDrawer
        categoryId={category.id}
        open={searchParams.get("edit") === "category-image"}
      />
    </>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.side.before",
});

export default CategoryImageWidget;
