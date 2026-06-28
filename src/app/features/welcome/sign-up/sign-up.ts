import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private authService = inject(AuthService);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  signUpForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', Validators.required),

    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),

    address: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),

    latitude: new FormControl<number | null>(null),
    longitude: new FormControl<number | null>(null),

    afm: new FormControl('', Validators.required),
  });

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const raw = this.signUpForm.getRawValue();

    if (raw.password !== raw.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    this.authService.register({
      username: raw.username!,
      password: raw.password!,
      confirmPassword: raw.confirmPassword!,

      firstName: raw.firstName!,
      lastName: raw.lastName!,
      email: raw.email!,
      phone: raw.phone!,

      address: raw.address!,
      city: raw.city!,
      country: raw.country!,

      latitude: raw.latitude,
      longitude: raw.longitude,

      afm: raw.afm!,
    }).subscribe({
      next: () => {
        this.successMessage =
          'Your registration request has been submitted and is pending administrator approval.';
        this.errorMessage = '';
        this.isSubmitting = false;
        this.signUpForm.reset();
      },
      error: (err) => {
        console.error('Failed to register user', err);
        this.errorMessage = err.error?.message ?? 'Registration failed.';
        this.successMessage = '';
        this.isSubmitting = false;
      },
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.signUpForm.get(controlName);
    return !!(control?.errors?.[errorName] && control.touched);
  }
}
