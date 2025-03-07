import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Food } from '../models/food.model';
import { AuthService } from './auth.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private apiUrl = 'https://localhost:7066/api/Foods'; // Ajustez selon votre backend

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des plats:', error);
          return throwError(() => new Error('Erreur de connexion avec le serveur'));
        })
      );
  }

  getFoodById(id: number): Observable<Food> {
    return this.http.get<Food>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createFood(food: Food): Observable<Food> {
    console.log('Envoi de la requête pour créer un plat:', food);
    
    return this.http.post<Food>(this.apiUrl, food, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('Réponse du serveur:', response)),
        catchError(error => {
          console.error('Erreur lors de la création du plat:', error);
          return throwError(() => new Error(`Erreur lors de la création du plat: ${error.message || 'Erreur inconnue'}`));
        })
      );
  }
  
  updateFood(id: number, food: Food): Observable<any> {
    console.log("Données envoyées pour update :", food);
    return this.http.put(`${this.apiUrl}/${id}`, food, { headers: this.getHeaders() });
  }
  

  deleteFood(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
