import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'vendas',
        loadChildren: () => import('../vendas/vendas.module').then(m => m.VendasPageModule)
      },
      {
        path: 'impressao',
        loadChildren: () => import('../impressao/impressao.module').then(m => m.ImpressaoPageModule)
      },
      {
        path: 'relatorios',
        loadChildren: () => import('../relatorios/relatorios.module').then(m => m.RelatoriosPageModule)
      },
      {
        path: 'configuracoes',
        loadChildren: () => import('../configuracoes/configuracoes.module').then(m => m.ConfiguracoesPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/vendas',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/vendas',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
