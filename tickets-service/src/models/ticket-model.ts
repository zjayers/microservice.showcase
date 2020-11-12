import mongoose, { Document, Schema } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// Attributes Interface
export interface ITicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// Document Interface
export interface ITicketDoc extends Document, ITicketAttrs {
  orderId?: string;
  version: number;
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
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
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
ticketSchema.plugin(updateIfCurrentPlugin);

// Override the static build function
ticketSchema.statics.build = (attributes: ITicketAttrs): ITicketDoc =>
  new TicketModel(attributes);

// Create the model
const TicketModel: ITicketModel = mongoose.model<ITicketDoc, ITicketModel>(
  "Ticket",
  ticketSchema
);

// Export
export { TicketModel };
