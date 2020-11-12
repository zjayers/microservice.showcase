import mongoose, { Document, Schema } from 'mongoose'

// Attributes Interface
export interface IPaymentAttrs {
  orderId: string;
  chargeId: string;
}

// Document Interface
export interface IPaymentDoc extends Document, IPaymentAttrs {}


// Model Interface
export interface IPaymentModel extends mongoose.Model<IPaymentDoc> {
  build(attrs: IPaymentAttrs): IPaymentDoc;
}

// Schema
const paymentSchema: Schema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    chargeId: {
      type: String,
      required: true,
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
paymentSchema.statics.build = (attributes: IPaymentAttrs): IPaymentDoc =>
  new PaymentModel({
    orderId: attributes.orderId,
    chargeId: attributes.chargeId,
  });

// Create the model
const PaymentModel: IPaymentModel = mongoose.model<IPaymentDoc, IPaymentModel>(
  "Payment",
  paymentSchema
);

// Export
export { PaymentModel };
