export enum UserRole {
  Registered,
  Admin
} // It's implied that the user role of guest is determined by a null value for the interface User, not a specific value within it.

export interface User {
  username: string;
  role: UserRole;
}

