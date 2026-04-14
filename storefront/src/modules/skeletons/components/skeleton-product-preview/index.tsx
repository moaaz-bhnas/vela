import { Container } from "@medusajs/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse space-y-3">
      <div className="relative">
        <Container className="relative w-full overflow-hidden p-4 bg-ui-bg-subtle rounded-large aspect-[11/14]">
          <div className="absolute inset-0 bg-ui-bg-subtle" />
        </Container>
      </div>
      <div className="txt-compact-medium justify-between flex flex-col gap-y-0.5">
        <div className="w-3/4 h-5 bg-ui-bg-subtle" />
        <div className="flex items-center gap-x-2 mt-1.5">
          <div className="w-16 h-5 bg-ui-bg-subtle" />
        </div>
        <div className="w-1/2 h-4 bg-ui-bg-subtle mt-2" />
      </div>
    </div>
  )
}

export default SkeletonProductPreview
