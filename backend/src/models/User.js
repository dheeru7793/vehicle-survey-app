'use strict';

const mongoose = require('mongoose');

const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  SURVEYOR: 'SURVEYOR',
});

const UserSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.SURVEYOR,
      index: true,
    },
    active: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
module.exports.ROLES = ROLES;
