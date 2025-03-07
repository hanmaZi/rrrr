import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MenuComponent } from './components/menu/menu.component';
import { FoodFormComponent } from './components/food-form/food-form.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/menu', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  { 
    path: 'food-add', 
    component: FoodFormComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'food-edit/:id', 
    component: FoodFormComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { path: '**', redirectTo: '/menu' }
];