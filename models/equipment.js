const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EquipmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  name: String,
  price: String,
  type: String,
  description: String,
  why: String,
  recommendation: String,
  brand: String,
  likes: { type: Schema.Types.ObjectId, ref: "User" },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  images: [String],
  year: Number,
  date: { type: Date, default: Date.now },
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
  tubeType: String,
});

const PedalSchema = new Schema({
  effectType: String,
  controls: [String]
});

const Equipment = mongoose.model("Equipment", EquipmentSchema);
const Guitar = Equipment.discriminator("Guitar", GuitarSchema);
const Amp = Equipment.discriminator("Amp", AmpSchema);
const Pedal = Equipment.discriminator("Pedal", PedalSchema);

const CommentSchema = new Schema({
  equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  text: String,
  date: { type: Date, default: Date.now }
});

module.exports = { Equipment, Guitar, Amp, Pedal, CommentSchema };