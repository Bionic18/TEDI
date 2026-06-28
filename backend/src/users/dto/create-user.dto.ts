export class CreateUserDto {
  username: string;
  password: string;
  confirmPassword: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  address: string;
  city: string;
  country: string;

  latitude?: number;
  longitude?: number;

  afm: string;
}
