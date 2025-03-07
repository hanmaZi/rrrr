
import { Component, OnInit } from '@angular/core';
import { FoodService } from '../../services/food.service';
import { AuthService } from '../../services/auth.service';
import { Food } from '../../models/food.model';
import { CommonModule,CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe]
})
export class MenuComponent implements OnInit {
  foods: Food[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private foodService: FoodService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFoods();
  }

  loadFoods(): void {
    this.loading = true;
    this.foodService.getAllFoods().subscribe({
      next: (data) => {
        this.foods = data;
        this.extractCategories();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des plats';
        this.loading = false;
        
        // Rediriger vers login si non authentifié
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  extractCategories(): void {
    const uniqueCategories = new Set<string>();
    this.foods.forEach(food => {
      if (food.category) {
        uniqueCategories.add(food.category);
      }
    });
    this.categories = Array.from(uniqueCategories);
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  showAllCategories(): void {
    this.selectedCategory = '';
  }

  filteredFoods(): Food[] {
    if (!this.selectedCategory) {
      return this.foods;
    }
    return this.foods.filter(food => food.category === this.selectedCategory);
  }

  editFood(id: number): void {
    this.router.navigate(['/food-edit', id]);
  }

  deleteFood(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      this.foodService.deleteFood(id).subscribe({
        next: () => {
          this.foods = this.foods.filter(food => food.id !== id);
          this.extractCategories();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}
