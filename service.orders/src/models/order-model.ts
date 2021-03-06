import { OrderStatus } from "@craterspace/common";
import mongoose, { Document, Schema } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { ITicketDoc } from "./ticket-model";

// Attributes Interface
export interface IOrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicketDoc;
}

// Document Interface
export interface IOrderDoc extends Document, IOrderAttrs {
  version: number;
}

// Model Interface
export interface IOrderModel extends mongoose.Model<IOrderDoc> {
  build(attrs: IOrderAttrs): IOrderDoc;
}

// Schema
const orderSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Setup optimistic concurrency control
// Rename __v to 'version'
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

// Override the static build function
orderSchema.statics.build = (attributes: IOrderAttrs): IOrderDoc =>
  new OrderModel(attributes);

// Create the model
const OrderModel: IOrderModel = mongoose.model<IOrderDoc, IOrderModel>(
  "Order",
  orderSchema
);

// Export
export { OrderModel };
export { OrderStatus };
