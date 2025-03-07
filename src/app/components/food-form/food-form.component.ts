import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FoodService } from '../../services/food.service';
import { Food } from '../../models/food.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-food-form',
  templateUrl: './food-form.component.html',
  styleUrls: ['./food-form.component.css'],
  standalone: true,
  
  imports: [CommonModule, ReactiveFormsModule]
})
export class FoodFormComponent implements OnInit {
  foodForm: FormGroup;
  isEditMode = false;
  foodId?: number;
  loading = false;
  error: string | null = null;
  errorMessage = ''; // Added error message property
  categories = ['Entrée', 'Plat principal', 'Dessert', 'Boisson']; // Catégories par défaut

  constructor(
    private fb: FormBuilder,
    private foodService: FoodService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.foodForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.foodId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.foodId;

    if (this.isEditMode) {
      this.loadFood();
    }
  }

  loadFood(): void {
    if (!this.foodId) return;

    this.loading = true;
    this.foodService.getFoodById(this.foodId).subscribe({
      next: (food) => {
        this.foodForm.patchValue({
          name: food.name,
          description: food.description,
          price: food.price,
          category: food.category
        });
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du plat';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.foodForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      const foodData: Food = this.foodForm.value;

      if (this.isEditMode && this.foodId) {
        // Mode édition
        this.foodService.updateFood(this.foodId, foodData).subscribe({
          next: () => {
            this.router.navigate(['/menu']);
          },
          error: (error) => {
            console.error('Erreur de mise à jour:', error);
            this.errorMessage = 'Erreur lors de la mise à jour du plat';
            this.loading = false;
          }
        });
      } else {
        // Mode création
        this.foodService.createFood(foodData).subscribe({
          next: (response) => {
            console.log('Plat créé avec succès:', response);
            this.router.navigate(['/menu']);
          },
          error: (error) => {
            console.error('Erreur de création:', error);
            this.errorMessage = 'Erreur lors de la création du plat';
            this.loading = false;
          }
        });
      }
    } else {
      // Formulaire invalide
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires';
      Object.keys(this.foodForm.controls).forEach(key => {
        const control = this.foodForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}