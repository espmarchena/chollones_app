import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DealsService, Deal } from '../services/deals.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { heart, heartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tab-saved',
  templateUrl: './tab-saved.page.html',
  styleUrls: ['./tab-saved.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class TabSavedPage {
  savedDeals$: Observable<Deal[]>;

  constructor(private dealsService: DealsService) {
    addIcons({ heart, heartOutline });
    this.savedDeals$ = this.dealsService.deals$.pipe(
      map(deals => deals.filter(d => d.isFavorite))
    );
  }

  toggleFavorite(deal: Deal) {
    this.dealsService.toggleFavorite(deal.id);
  }
}
