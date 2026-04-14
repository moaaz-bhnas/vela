import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="product-page-constraint">
      <div className="flex flex-col gap-stack items-center text-center mb-stack">
        <div className="w-20 h-6 animate-pulse bg-ui-bg-subtle"></div>
        <div className="flex flex-col gap-4 items-center text-center mb-16">
          <div className="w-96 h-10 animate-pulse bg-ui-bg-subtle"></div>
          <div className="w-48 h-10 animate-pulse bg-ui-bg-subtle"></div>
        </div>
      </div>
      <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-stack flex-1">
        {repeat(3).map((index) => (
          <li key={index}>
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonRelatedProducts
