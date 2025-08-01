import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { VendasPageRoutingModule } from './vendas-routing.module';

import { VendasPage } from './vendas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    VendasPageRoutingModule
  ],
  declarations: [VendasPage]
})
export class VendasPageModule {}
