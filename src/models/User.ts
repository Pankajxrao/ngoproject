export interface UserModel {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "ngo" | "restaurant";
  createdAt: Date;
  updatedAt: Date;
}