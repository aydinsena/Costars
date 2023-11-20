const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const walletSchema = new Schema(
  {
    walletvalues: [
      {
        name: String,
        amount: Number,
        sum: Number,
      },
    ],
    total: Number,
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;
