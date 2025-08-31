import { connectionToDatabase } from "@/lib/db";
import User from "@/models/User";

(async () => {
  await connectionToDatabase();
  const users = await User.find();
  console.log(users);
})();