// src/app/pages/dashboard/components/bestsellingwidget.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ChartModule],
    template: `
        <div class="chart-card">
            <div class="chart-header">
                <span class="chart-title">📊 Réservations par mois</span>
                <span class="chart-subtitle">Évolution des réservations</span>
            </div>
            <p-chart 
                type="bar" 
                [data]="chartData" 
                [options]="chartOptions"
                height="200px"
            ></p-chart>
        </div>
    `,
    styles: [`
        .chart-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            margin: 0 1.5rem 1.5rem;
        }

        .chart-header {
            margin-bottom: 1rem;
        }

        .chart-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d1b69;
            display: block;
        }

        .chart-subtitle {
            color: #888;
            font-size: 0.9rem;
        }
    `]
})
export class BestSellingWidget implements OnInit {
    @Input() bookingData: number[] = [];

    chartData: any;
    chartOptions: any;

    ngOnInit() {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        this.chartData = {
            labels: months,
            datasets: [
                {
                    label: '📅 Réservations',
                    data: this.bookingData || Array(12).fill(0),
                    backgroundColor: [
                        'rgba(255, 107, 157, 0.6)',
                        'rgba(255, 107, 157, 0.5)',
                        'rgba(255, 107, 157, 0.4)',
                        'rgba(255, 107, 157, 0.3)',
                        'rgba(255, 107, 157, 0.5)',
                        'rgba(255, 107, 157, 0.6)',
                        'rgba(255, 107, 157, 0.7)',
                        'rgba(255, 107, 157, 0.8)',
                        'rgba(255, 107, 157, 0.6)',
                        'rgba(255, 107, 157, 0.5)',
                        'rgba(255, 107, 157, 0.4)',
                        'rgba(255, 107, 157, 0.6)'
                    ],
                    borderColor: '#ff6b6b',
                    borderWidth: 2,
                    borderRadius: 8
                }
            ]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: { family: 'Lato, sans-serif' },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 1,
                        font: { family: 'Lato, sans-serif' }
                    }
                },
                x: {
                    ticks: {
                        font: { family: 'Lato, sans-serif' }
                    }
                }
            }
        };
    }
}