import { Modules } from "@medusajs/framework/utils";
import { INotificationModuleService } from "@medusajs/framework/types";
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { EmailTemplates } from "../modules/email-notifications/templates";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION);
  const query = container.resolve("query");

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ["*", "items.*", "summary.*", "shipping_address.*"],
    filters: { id: data.id },
  });

  if (!order) {
    return;
  }

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: "info@example.com",
          subject: "Your order has been placed",
        },
        order,
        shippingAddress: order.shipping_address,
        preview: "Thank you for your order!",
      },
    });
  } catch (error) {
    console.error("Error sending order confirmation notification:", error);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
