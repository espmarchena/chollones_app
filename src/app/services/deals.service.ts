import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Deal {
    id: number;
    title: string;
    store: string;
    price: number;
    originalPrice: number;
    image: string;
    temperature: number;
    url: string;
    isFavorite: boolean;
    isNew: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DealsService {
    private _deals = new BehaviorSubject<Deal[]>([
        {
            id: 1,
            title: 'Xiaomi Pad 6 8GB/256GB Versión Global',
            store: 'Amazon ES',
            price: 299.99,
            originalPrice: 399.99,
            image: 'https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1688632616.48641150.png',
            temperature: 1250,
            url: '#',
            isFavorite: false,
            isNew: true
        },
        {
            id: 2,
            title: 'Zapatillas Nike Air Force 1 \'07',
            store: 'Nike Store',
            price: 79.95,
            originalPrice: 119.99,
            image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b1b94d1c-3729-45a4-9e90-f55d04523771/air-force-1-07-zapatillas-GjGXSP.png',
            temperature: 840,
            url: '#',
            isFavorite: false,
            isNew: false
        },
        {
            id: 3,
            title: 'Sony WH-1000XM5 Cancelación de Ruido',
            store: 'MediaMarkt',
            price: 289.00,
            originalPrice: 449.00,
            image: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_UF894,1000_QL80_.jpg',
            temperature: 2100,
            url: '#',
            isFavorite: false,
            isNew: true
        },
        {
            id: 4,
            title: 'Pack 24 Latas Coca-Cola Zero',
            store: 'Carrefour',
            price: 12.50,
            originalPrice: 18.90,
            image: 'https://www.carrefour.es/images/product/500x500/5449000214911.jpg',
            temperature: 450,
            url: '#',
            isFavorite: false,
            isNew: false
        }
    ]);

    deals$ = this._deals.asObservable();

    constructor() { }

    toggleFavorite(dealId: number) {
        const currentDeals = this._deals.getValue();
        const updatedDeals = currentDeals.map(deal => {
            if (deal.id === dealId) {
                return { ...deal, isFavorite: !deal.isFavorite };
            }
            return deal;
        });
        this._deals.next(updatedDeals);
    }
}
