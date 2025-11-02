const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/expense_tracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User schema (matching your User model)
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

// Define Expense schema (matching your Expense model)
const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["self", "lent", "credit_card"],
      default: "self",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define Repayment schema (matching your Repayment model)
const repaymentSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    repaidAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
const Expense = mongoose.model("Expense", expenseSchema);
const Repayment = mongoose.model("Repayment", repaymentSchema);

async function migrateData() {
  try {
    console.log("Starting data migration...");

    // Create the specified user if it doesn't exist
    let user = await User.findOne({ username: "vamshigangadhar" });

    if (!user) {
      console.log("Creating user: vamshigangadhar");
      const hashedPassword = await bcrypt.hash("vamshi123@A", 10);
      user = new User({
        username: "vamshigangadhar",
        email: "vamshi@example.com", // You can change this if needed
        password: hashedPassword,
      });
      await user.save();
      console.log("User created successfully");
    } else {
      console.log("User already exists:", user.username);
    }

    // Check for expenses without userId
    const expensesWithoutUserId = await Expense.find({
      userId: { $exists: false },
    });
    console.log(
      `Found ${expensesWithoutUserId.length} expenses without userId`
    );

    if (expensesWithoutUserId.length > 0) {
      // Update all expenses without userId to belong to the specified user
      const updateResult = await Expense.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: user._id } }
      );
      console.log(`Updated ${updateResult.modifiedCount} expenses with userId`);
    }

    // Check for repayments without userId
    const repaymentsWithoutUserId = await Repayment.find({
      userId: { $exists: false },
    });
    console.log(
      `Found ${repaymentsWithoutUserId.length} repayments without userId`
    );

    if (repaymentsWithoutUserId.length > 0) {
      // Update all repayments without userId to belong to the specified user
      const updateResult = await Repayment.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: user._id } }
      );
      console.log(
        `Updated ${updateResult.modifiedCount} repayments with userId`
      );
    }

    // Verify the migration
    const userExpenseCount = await Expense.countDocuments({ userId: user._id });
    const userRepaymentCount = await Repayment.countDocuments({
      userId: user._id,
    });

    console.log(`Migration completed successfully!`);
    console.log(`User ${user.username} now has:`);
    console.log(`- ${userExpenseCount} expenses`);
    console.log(`- ${userRepaymentCount} repayments`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the migration
migrateData();
