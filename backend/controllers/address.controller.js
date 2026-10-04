const Address = require("../models/Address");

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.status(200).json({
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const createAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Required address fields are missing",
      });
    }

    if (isDefault) {
      await Address.updateMany(
        { user: req.user.userId },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      user: req.user.userId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country: country || "India",
      isDefault: isDefault || false,
    });

    res.status(201).json({
      message: "Address created successfully",
      address,
    });
  } catch (error) {
    console.error("Create address error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        {
          user: req.user.userId,
          _id: { $ne: address._id },
        },
        { isDefault: false }
      );
    }

    address.fullName = fullName ?? address.fullName;
    address.phone = phone ?? address.phone;
    address.addressLine1 = addressLine1 ?? address.addressLine1;
    address.addressLine2 = addressLine2 ?? address.addressLine2;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.pincode = pincode ?? address.pincode;
    address.country = country ?? address.country;

    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    await address.save();

    res.status(200).json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};


module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};