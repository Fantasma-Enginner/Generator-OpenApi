import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  // enableProdMode is not needed in newer Angular versions
}

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(HttpClientModule)],
}).catch((err) => console.error(err));
