import mongoose, { Document, Schema } from "mongoose";
import { OrderModel, OrderStatus } from "./order-model";

// Attributes Interface
export interface ITicketAttrs {
  title: string;
  price: number;
}

// Document Interface
export interface ITicketDoc extends Document, ITicketAttrs {
  isReserved(): Promise<boolean>;
}

// Model Interface
export interface ITicketModel extends mongoose.Model<ITicketDoc> {
  build(attrs: ITicketAttrs): ITicketDoc;
}

// Schema
const ticketSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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

// Override the static build function
ticketSchema.statics.build = (attributes: ITicketAttrs): ITicketDoc =>
  new TicketModel(attributes);

// Run query to look at all orders. Find an order where the ticket is
// the ticket that was just found *and* the orders status is *not*
// cancelled. If a matching order is found with this query, the ticket *is*
// reserved
ticketSchema.methods.isReserved = async function () {
  const existingOrder = await OrderModel.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

// Create the model
const TicketModel: ITicketModel = mongoose.model<ITicketDoc, ITicketModel>(
  "Ticket",
  ticketSchema
);

// Export
export { TicketModel };
