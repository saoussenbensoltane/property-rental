// src/app/pages/dashboard/components/statswidget.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `
        <div class="stats-grid">
            <div class="stat-card" *ngFor="let stat of stats">
                <div class="stat-icon" [style.background]="stat.color">
                    <span>{{ stat.icon }}</span>
                </div>
                <div class="stat-info">
                    <span class="stat-value">{{ stat.value }}</span>
                    <span class="stat-label">{{ stat.label }}</span>
                    <span class="stat-trend" *ngIf="stat.trend">{{ stat.trend }}</span>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
            gap: 1rem;
            margin: 0 1.5rem 1.5rem;
        }

        .stat-card {
            background: white;
            border-radius: 16px;
            padding: 1rem 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-left: 4px solid transparent;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-card:nth-child(1) { border-left-color: #74b9ff; }
        .stat-card:nth-child(2) { border-left-color: #00b894; }
        .stat-card:nth-child(3) { border-left-color: #fdcb6e; }
        .stat-card:nth-child(4) { border-left-color: #ff6b6b; }
        .stat-card:nth-child(5) { border-left-color: #f39c12; }
        .stat-card:nth-child(6) { border-left-color: #00b894; }

        .stat-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .stat-info {
            flex: 1;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d1b69;
            display: block;
        }

        .stat-label {
            color: #888;
            font-size: 0.8rem;
        }

        .stat-trend {
            font-size: 0.7rem;
            color: #00b894;
            margin-left: 0.3rem;
        }
    `]
})
export class StatsWidget {
    @Input() stats: any[] = [];
}