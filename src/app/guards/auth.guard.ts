import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.validateToken().pipe(
      map(isValid => {
        if (!isValid) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }),
      catchError((error) => {
        console.error('Erro na validação do token:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}