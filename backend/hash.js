import bcrypt from "bcrypt";

const run = async () => {
  const mobile = "9079610141";
  const password = "Priyansh@90796";

  const hashedMobile = await bcrypt.hash(mobile, 10);
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("Hashed Mobile:", hashedMobile);
  console.log("Hashed Password:", hashedPassword);
};

run();