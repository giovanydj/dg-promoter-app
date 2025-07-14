import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule } from '@ionic/angular';

import { ImpressaoPageRoutingModule } from './impressao-routing.module';

import { ImpressaoPage } from './impressao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    ImpressaoPageRoutingModule
  ],
  declarations: [ImpressaoPage]
})
export class ImpressaoPageModule {}
