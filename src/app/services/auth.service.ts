import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginRequest, AuthResponse } from '../models/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7066/api'; 
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isPlatformBrowser: boolean;

  constructor(
    private http: HttpClient, 
    private jwtHelper: JwtHelperService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isPlatformBrowser = isPlatformBrowser(this.platformId);
    if (this.isPlatformBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = this.jwtHelper.decodeToken(token);
          this.currentUserSubject.next({
            username: decodedToken[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
            ],
            role: decodedToken[
              'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
            ]
          });
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, loginRequest).pipe(
      tap((response) => {
        if (this.isPlatformBrowser) {
          localStorage.setItem('token', response.token);
          const decodedToken = this.jwtHelper.decodeToken(response.token);
          this.currentUserSubject.next({
            username: decodedToken[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
            ],
            role: decodedToken[
              'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
            ]
          });
        }
      })
    );
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/register`, user);
  }

  logout(): void {
    if (this.isPlatformBrowser) {
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    if (!this.isPlatformBrowser) return false; //Added check
    const token = localStorage.getItem('token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  isAdmin(): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === 'Admin';
  }

  getToken(): string | null {
    if (!this.isPlatformBrowser) return null; //Added check
    return localStorage.getItem('token');
  }
}