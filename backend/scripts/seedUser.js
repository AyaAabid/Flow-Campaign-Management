// backend/scripts/seedUser.js
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

(async () => {
  try {
    await connectDB();

    const username = "Jhon_editor";
    const plain = "jhon@123";
    const email = "editor.101@example.com";

    const exists = await User.findOne({ username });
    if (exists) {
      console.log(
        `User '${username}' already exists. Updating password & basics…`
      );
      exists.password = await bcrypt.hash(plain, 10);
      exists.email = email;
      exists.firstName = "Editor";
      exists.lastName = "User";
      exists.role = "Editor";
      await exists.save();
      console.log("User updated.");
    } else {
      const hash = await bcrypt.hash(plain, 10);
      await User.create({
        firstName: "Editor",
        lastName: "User",
        email,
        username,
        password: hash,
        position: "Sales Director",
        role: "Editor",
      });
      console.log(`User '${username}' created.`);
    }

    console.log("Done.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
