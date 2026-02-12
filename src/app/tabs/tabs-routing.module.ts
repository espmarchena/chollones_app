import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () => import('../tab1/tab1.page').then(m => m.Tab1Page)
      },
      {
        path: 'tab-categories',
        loadComponent: () => import('../tab-categories/tab-categories.page').then(m => m.TabCategoriesPage)
      },
      {
        path: 'tab-notifications',
        loadComponent: () => import('../tab-notifications/tab-notifications.page').then(m => m.TabNotificationsPage)
      },
      {
        path: 'tab-saved',
        loadComponent: () => import('../tab-saved/tab-saved.page').then(m => m.TabSavedPage)
      },
      {
        path: 'tab-profile',
        loadComponent: () => import('../tab-profile/tab-profile.page').then(m => m.TabProfilePage)
      },
      // Keep old tab2 route for FAB if needed, or redirect
      {
        path: 'tab2',
        loadComponent: () => import('../tab2/tab2.page').then(m => m.Tab2Page)
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
