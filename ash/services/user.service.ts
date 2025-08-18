import User, { IUser } from "@/models/User";
import connectDB from "@/lib/mongodb";

export class UserService {
  static async createUser(userData: Partial<IUser>): Promise<IUser> {
    await connectDB();
    return await User.create(userData);
  }

  static async getAllUsers(): Promise<IUser[]> {
    await connectDB();
    return await User.find({}).sort({ createdAt: -1 });
  }

  static async getUserById(id: string): Promise<IUser | null> {
    await connectDB();
    return await User.findById(id);
  }

  static async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    await connectDB();
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  static async deleteUser(id: string): Promise<IUser | null> {
    await connectDB();
    return await User.findByIdAndDelete(id);
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return await User.findOne({ email: email.toLowerCase() });
  }
}
