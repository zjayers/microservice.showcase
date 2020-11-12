import { OrderStatus } from "@craterspace/common";
import mongoose, { Document, Schema } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// Attributes Interface
export interface IOrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// Document Interface
export interface IOrderDoc extends Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface IFindByIdAndVersion {
  id: string;
  version: number;
}

// Model Interface
export interface IOrderModel extends mongoose.Model<IOrderDoc> {
  build(attrs: IOrderAttrs): IOrderDoc;

  findByIdAndPrevVersion(event: IFindByIdAndVersion): Promise<IOrderDoc | null>;
}

// Schema
const orderSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
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

// Find tickets that have the current ticket id but a version that is one
// less than the current version of the document. FOR USE WITH THE
// MONGOOSE-UPDATE-IF-CURRENT PLUGIN
orderSchema.statics.findByIdAndPrevVersion = (event: IFindByIdAndVersion) =>
  OrderModel.findOne({
    _id: event.id,
    version: event.version - 1,
  });

// Override the static build function
orderSchema.statics.build = (attributes: IOrderAttrs): IOrderDoc =>
  new OrderModel({
    _id: attributes.id,
    version: attributes.version,
    price: attributes.price,
    userId: attributes.userId,
    status: attributes.status,
  });

// Create the model
const OrderModel: IOrderModel = mongoose.model<IOrderDoc, IOrderModel>(
  "Order",
  orderSchema
);

// Export
export { OrderModel };
export { OrderStatus };
