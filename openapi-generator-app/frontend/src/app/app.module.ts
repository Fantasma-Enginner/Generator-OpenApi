import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [],
  imports: [BrowserModule, HttpClientModule, FormsModule, AppComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
