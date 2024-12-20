import mongoose, {Schema} from "mongoose";

const statementSchema = new Schema(
    {
        name:{
            type:String,
            required:true,
            index:true
        },
        amount: {
            type:Number,
            required:true
        },
        type:{
            type:String,
            enum:["Income","Expend"],
            required:true
        },
        userId:{ 
            type: Schema.Types.ObjectId,
            ref:'User',
            required: true
        }
    },
    {
        timestamps:true
    }
)

export const Statement = new mongoose.model("Statement",statementSchema);