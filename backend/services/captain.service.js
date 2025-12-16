const captainModel = require("../models/captain.model");

module.exports.createCaptain = async ({
  firstname,
  lastname,
  email,
  password,
  plate,
  color,
  capacity,
  vehicleType,
}) => {
  if (
    !firstname ||
    !email ||
    !password ||
    !plate ||
    !color ||
    !capacity ||
    !vehicleType
  ) {
    throw new Error("All fields are required");
  }

  const captain = captainModel.create({
    fullname: { firstname, lastname },
    email,
    password,
    vehicle: {
      plate,
      color,
      capacity,
      vehicleType,
    },
  });
  return captain; 
};
