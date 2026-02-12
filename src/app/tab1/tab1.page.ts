import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { add, heart, heartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { DealsService, Deal } from '../services/deals.service';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class Tab1Page {
  deals$: Observable<Deal[]>;

  constructor(private dealsService: DealsService) {
    addIcons({ add, heart, heartOutline });
    this.deals$ = this.dealsService.deals$;
  }

  toggleFavorite(deal: Deal) {
    this.dealsService.toggleFavorite(deal.id);
  }
}
