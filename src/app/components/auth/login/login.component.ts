import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from './../../../services/auth.service';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

interface FormControls {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
})

export class LoginComponent {

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private authService: AuthService,) {

    this.createForm();
  }

  public formGroup!: FormGroup<FormControls>;

  public async login(): Promise<void> {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      
      return;
    }
    
    const body = {
      email: this.formGroup.controls.email.value!,
      password: this.formGroup.controls.password.value!.trim(),
    };

    const request = this.authService.login(body);
    const response = await lastValueFrom(request);

    switch (response.status) {
      case 200:
        this.router.navigate([ '' ]);

        break;
      case 404:
        this.openSnackBar('Wrong email or password', 'error');
    }
  }

  public hasError(controlName: string, errorName: string) {
    return this.formGroup.get(controlName)?.hasError(errorName) && this.formGroup.get(controlName)?.touched;
  }

  private openSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'x', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error'],
    });
  }

  private createForm() {
    const formControls: FormControls = {
      email: this.formBuilder.control('', [ Validators.required, Validators.pattern(/^[a-zA-Z0-9_\.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$/) ]),
      password: this.formBuilder.control('', [ Validators.required ]),
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

}
