import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    content: {
      type: String,
    },

    image: {
      type: String,
    },

    url: {
      type: String,
      unique: true,
      required: true,
    },

    source: {
      type: String,
    },

    category: {
  type: String,
  enum: [
    "Ocean Freight",
    "Air Freight",
    "Road Freight",
    "Freight Forwarding",
    "Supply Chain",
    "Import & Export"
  ],
  required: true
},

    isSaved: {
  type: Boolean,
  default: false,
},

    publishedAt: {
      type: Date,
    },


    // IMPORTANT
    // When we fetched from GNews
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps:true
  }
);


export default mongoose.model(
  "News",
  newsSchema
);