import mongoose, {Document, Schema} from 'mongoose';

// Attributes Interface
export interface ITicketAttrs {
    title: string;
    price: number;
    userId: string;
}

// Document Interface
export interface ITicketDoc extends Document, ITicketAttrs {
}

// Model Interface
export interface ITicketModel extends mongoose.Model<ITicketDoc> {
    build(attrs: ITicketAttrs): ITicketDoc;
}

// Schema
const ticketSchema: Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// Override the static build function
ticketSchema.statics.build = (attributes: ITicketAttrs): ITicketDoc => new TicketModel(attributes)

// Create the model
const TicketModel: ITicketModel = mongoose.model<ITicketDoc, ITicketModel>(
    'Ticket',
    ticketSchema
)

// Export
export {TicketModel};