export class PublicUserDto {
  id: number;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
