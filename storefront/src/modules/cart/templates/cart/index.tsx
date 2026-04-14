import Container from "@modules/common/components/container-section"
import ItemsTemplate from "../items"
import Summary from "../summary"
import EmptyCartMessage from "../../components/empty-cart-message"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = async ({
  cart,
}: {
  cart: HttpTypes.StoreCart | null
}) => {
  return (
    <div className="py-content-y">
      <Container noPadding data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col bg-ui-bg-base py-6 gap-y-6">
              <ItemsTemplate items={cart?.items} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-stack sticky top-12">
                {cart && cart.region && (
                  <>
                    <div className="bg-ui-bg-base py-6">
                      <Summary cart={cart} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </Container>
    </div>
  )
}

export default CartTemplate
