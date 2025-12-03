// const User = require('../models/user');

// exports.getUserProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const user = await User.findById(userId)
//       .select("-otpHash -otpExpiresAt -__v"); // Hide sensitive fields

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.json({
//       ok: true,
//       user: {
//         id: user._id,
//         phone: user.phone,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         createdAt: user.createdAt
//       }
//     });

//   } catch (err) {
//     console.error("Profile fetch error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// exports.updateUserProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // from middleware
//     const { name, email } = req.body;

//     // Only allow updating allowed fields
//     const updateData = {};
//     if (name) updateData.name = name;
//     if (email) updateData.email = email;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       updateData,
//       { new: true } // return updated record
//     ).select("-otpHash -otpExpiresAt -__v");

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.json({
//       ok: true,
//       message: "Profile updated successfully",
//       user: {
//         id: updatedUser._id,
//         phone: updatedUser.phone,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         role: updatedUser.role,
//         createdAt: updatedUser.createdAt
//       }
//     });

//   } catch (err) {
//     console.error('Profile update error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// controllers/userController.js - Add these functions to your existing controller

const User = require('../models/user');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select("-otpHash -otpExpiresAt -__v"); // Hide sensitive fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      ok: true,
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from middleware
    const { name, email } = req.body;

    // Only allow updating allowed fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true } // return updated record
    ).select("-otpHash -otpExpiresAt -__v");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      ok: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      pinCode,
      houseNumber,
      address,
      locality,
      city,
      state,
      addressType,
      isDefault
    } = req.body;

    // Validate required fields
    if (!name || !mobileNumber || !pinCode || !houseNumber || 
        !address || !locality || !city || !state) {
      return res.status(400).json({
        ok: false,
        message: 'All fields are required'
      });
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        ok: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Validate pin code
    if (!/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({
        ok: false,
        message: 'Please enter a valid 6-digit pin code'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // If this is the first address, make it default
    const makeDefault = user.addresses.length === 0 || isDefault;

    // Add new address
    user.addresses.push({
      name,
      mobileNumber,
      pinCode,
      houseNumber,
      address,
      locality,
      city,
      state,
      addressType: addressType || 'Home',
      isDefault: makeDefault
    });

    await user.save();

    res.status(201).json({
      ok: true,
      message: 'Address added successfully',
      address: user.addresses[user.addresses.length - 1]
    });

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to add address',
      error: error.message
    });
  }
};

// Get all addresses for user
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    res.json({
      ok: true,
      addresses: user.addresses || []
    });

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
};

// Get single address by ID
exports.getAddressById = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        ok: false,
        message: 'Address not found'
      });
    }

    res.json({
      ok: true,
      address
    });

  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch address',
      error: error.message
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      pinCode,
      houseNumber,
      address,
      locality,
      city,
      state,
      addressType,
      isDefault
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    const addressToUpdate = user.addresses.id(req.params.addressId);

    if (!addressToUpdate) {
      return res.status(404).json({
        ok: false,
        message: 'Address not found'
      });
    }

    // Validate mobile number if provided
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({
        ok: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Validate pin code if provided
    if (pinCode && !/^\d{6}$/.test(pinCode)) {
      return res.status(400).json({
        ok: false,
        message: 'Please enter a valid 6-digit pin code'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update fields
    if (name) addressToUpdate.name = name;
    if (mobileNumber) addressToUpdate.mobileNumber = mobileNumber;
    if (pinCode) addressToUpdate.pinCode = pinCode;
    if (houseNumber) addressToUpdate.houseNumber = houseNumber;
    if (address) addressToUpdate.address = address;
    if (locality) addressToUpdate.locality = locality;
    if (city) addressToUpdate.city = city;
    if (state) addressToUpdate.state = state;
    if (addressType) addressToUpdate.addressType = addressType;
    if (isDefault !== undefined) addressToUpdate.isDefault = isDefault;

    await user.save();

    res.json({
      ok: true,
      message: 'Address updated successfully',
      address: addressToUpdate
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    const addressToDelete = user.addresses.id(req.params.addressId);

    if (!addressToDelete) {
      return res.status(404).json({
        ok: false,
        message: 'Address not found'
      });
    }

    const wasDefault = addressToDelete.isDefault;
    
    // Remove the address
    addressToDelete.remove();

    // If deleted address was default and there are other addresses, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      ok: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    const addressToSetDefault = user.addresses.id(req.params.addressId);

    if (!addressToSetDefault) {
      return res.status(404).json({
        ok: false,
        message: 'Address not found'
      });
    }

    // Unset all defaults
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
    addressToSetDefault.isDefault = true;

    await user.save();

    res.json({
      ok: true,
      message: 'Default address updated successfully',
      address: addressToSetDefault
    });

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
};
