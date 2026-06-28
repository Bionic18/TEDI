export class PublicUserDto {
  id: number;
  username: string;
  email: string;
  roles: string[];
  active: boolean;

  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  afm?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}
