import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, SignupRequest, JwtResponse, User } from '../models/user.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Initialize current user from token
    const token = this.tokenService.getToken();
    if (token) {
      const user = this.tokenService.getUser();
      this.currentUserSubject.next(user);
    }
  }

  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.tokenService.saveToken(response.accessToken);
          this.tokenService.saveUser(response);
          this.currentUserSubject.next({
            id: response.id,
            username: response.username,
            email: response.email,
            fullName: response.fullName
          });
        })
      );
  }

  signup(userData: SignupRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/signup`, userData);
  }

  logout(): void {
    this.tokenService.signOut();
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.tokenService.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}