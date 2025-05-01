const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EquipmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
});

const GuitarSchema = new Schema({
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

const Equipment = mongoose.model("Equipment", EquipmentSchema);
const Guitar = Equipment.discriminator("Guitar", GuitarSchema);
const Amp = Equipment.discriminator("Amp", AmpSchema);
const Pedal = Equipment.discriminator("Pedal", PedalSchema);

const CommentSchema = new Schema({
  equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment" },
  username: String,
  text: String,
  date: { 
    type: Date, 
    default: () => new Date(new Date().toISOString())
  }
});

const Comments = mongoose.model("Comment", CommentSchema);

module.exports = { Equipment, Guitar, Amp, Pedal, Comments };