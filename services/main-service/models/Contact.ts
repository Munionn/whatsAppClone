import { Schema, model} from "mongoose";


const ContactShema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  contactUserId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    default: "",
  },
  blocked: {
    type: Boolean,
    default: false,

  }
  
})

export default model("Contact", ContactShema);