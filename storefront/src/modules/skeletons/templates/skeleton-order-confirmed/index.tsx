import Container from "@modules/common/components/container-section"
import SkeletonOrderConfirmedHeader from "@modules/skeletons/components/skeleton-order-confirmed-header"
import SkeletonOrderInformation from "@modules/skeletons/components/skeleton-order-information"
import SkeletonOrderItems from "@modules/skeletons/components/skeleton-order-items"

const SkeletonOrderConfirmed = () => {
  return (
    <div className="bg-ui-bg-subtle py-6 min-h-[calc(100vh-64px)] animate-pulse">
      <Container noPadding className="flex justify-center">
        <div className="max-w-4xl h-full bg-ui-bg-base w-full p-10">
          <SkeletonOrderConfirmedHeader />

          <SkeletonOrderItems />

          <SkeletonOrderInformation />
        </div>
      </Container>
    </div>
  )
}

export default SkeletonOrderConfirmed
