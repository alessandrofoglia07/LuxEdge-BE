import mongoose from 'mongoose';
export const toObjectId = (str) => new mongoose.Types.ObjectId(str);
