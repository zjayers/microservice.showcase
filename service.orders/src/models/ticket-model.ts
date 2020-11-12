import mongoose, { Document, Schema } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderModel, OrderStatus } from "./order-model";

// Attributes Interface
export interface ITicketAttrs {
  id: string;
  title: string;
  price: number;
}

// Document Interface
export interface ITicketDoc extends Document {
  title: string;
  price: number;
  version: number;

  isReserved(): Promise<boolean>;
}

interface IFindByIdAndVersion {
  id: string;
  version: number;
}

// Model Interface
export interface ITicketModel extends mongoose.Model<ITicketDoc> {
  build(attrs: ITicketAttrs): ITicketDoc;

  findByIdAndPrevVersion(
    event: IFindByIdAndVersion
  ): Promise<ITicketDoc | null>;
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

// Setup optimistic concurrency control
// Rename __v to 'version'
ticketSchema.set("versionKey", "version");

// Reliance on the mongoose plugin in case the ticket versioning
// schema does not match how this plugin increments versions
ticketSchema.plugin(updateIfCurrentPlugin);

// Find tickets that have the current ticket id but a version that is one
// less than the current version of the document
// ticketSchema.pre("save", function (done) {
//   // Reassign the $where property to allow customization of version checking
//   // Modify the '- 1' to correspond to versioning scheme of the incoming data
//   // @ts-ignore
//   this.$where = {
//     version: this.get("version") - 1,
//   };
//   console.log("In Model", this.get("version"));
//
//   done();
// });

// Override the static build function
ticketSchema.statics.build = (attributes: ITicketAttrs): ITicketDoc =>
  new TicketModel({
    _id: attributes.id,
    title: attributes.title,
    price: attributes.price,
  });

// Find tickets that have the current ticket id but a version that is one
// less than the current version of the document. FOR USE WITH THE
// MONGOOSE-UPDATE-IF-CURRENT PLUGIN
ticketSchema.statics.findByIdAndPrevVersion = (event: IFindByIdAndVersion) =>
  TicketModel.findOne({
    _id: event.id,
    version: event.version - 1,
  });

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
