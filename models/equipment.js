const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EquipmentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  price: String,
  type: String,
  description: { type: String, required: true },
  why: String,
  recommendation: String,
  brand: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  images: [String],
  year: Number,
  date: { 
    type: Date, 
    default: () => new Date(new Date().toISOString())
  },
  colour: String,
  rating: { type: Number, default: 0 },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  url: { type: String, validate: { validator: v => /^https?:\/\/[^\s$.?#].[^\s]*$/.test(v), message: props => `${props.value} is not a valid URL` } }
});

const GuitarSchema = new Schema({
  strings: Number,
  shape: String,
  pickups: String,
});

const BassSchema = new Schema({
  strings: Number,
  shape: String,
  pickups: String,
});

const AmpSchema = new Schema({
  power: Number,
  ampType: String,
});

const PedalSchema = new Schema({
  effectType: String,
});

const AccessorySchema = new Schema({
  accessoryType: String,
});

const Equipment = mongoose.model("Equipment", EquipmentSchema);
const Accessory = Equipment.discriminator("Accessory", AccessorySchema);
const Amp = Equipment.discriminator("Amp", AmpSchema);
const Bass = Equipment.discriminator("Bass", BassSchema);
const Guitar = Equipment.discriminator("Guitar", GuitarSchema);
const Pedal = Equipment.discriminator("Pedal", PedalSchema);

const CommentSchema = new Schema({
  equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  text: String,
  date: { 
    type: Date, 
    default: () => new Date(new Date().toISOString())
  }
});

const Comments = mongoose.model("Comment", CommentSchema);

module.exports = { Equipment, Guitar, Amp, Pedal, Accessory, Bass, Comments };