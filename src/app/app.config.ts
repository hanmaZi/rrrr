import { ApplicationConfig, inject, PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './interceptors/auth.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';

export function jwtOptionsFactory() {
  const platformId = inject(PLATFORM_ID);
  return {
    tokenGetter: () => {
      if (isPlatformBrowser(platformId)) {
        return localStorage.getItem('token');
      }
      return null;
    },
    allowedDomains: ['localhost:7066'],
    disallowedRoutes: ['localhost:7066/api/auth']
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimations(),
    { provide: JWT_OPTIONS, useFactory: jwtOptionsFactory },
    JwtHelperService
  ]
};