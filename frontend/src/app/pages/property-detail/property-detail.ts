// src/app/pages/property-detail/property-detail.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { ReviewService, Review } from '../../services/review.service';
import { Header } from '@/app/shared/header';
import { BookingService } from '@/app/services/booking';
import { AuthService } from '@/app/services/auth';
import { PropertyService, Property } from '@/app/services/property';

@Component({
    selector: 'app-property-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        CarouselModule,
        DialogModule,
        RatingModule,
        TextareaModule,
        ToastModule,
        ConfirmDialogModule,
        DatePickerModule,
        Header
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="top-center"></p-toast>
        <p-confirmDialog 
            [style]="{ width: '450px' }"
            acceptButtonStyleClass="p-button-danger p-button-raised"
            rejectButtonStyleClass="p-button-secondary p-button-raised"
            acceptIcon="pi pi-check"
            rejectIcon="pi pi-times">
        </p-confirmDialog>
        <app-header></app-header>

        <div class="property-detail-container" *ngIf="property(); else loading">
            <!-- 🏠 CAROUSEL IMAGES -->
            <div class="property-carousel">
                @if (property()!.images && property()!.images.length > 0) {
                    <p-carousel
                        [value]="property()!.images"
                        [numVisible]="1"
                        [numScroll]="1"
                        [circular]="true"
                        [showIndicators]="true"
                        [showNavigators]="property()!.images.length > 1"
                        styleClass="mb-6"
                    >
                        <ng-template let-image #item>
                            <img [src]="image" class="carousel-image" />
                        </ng-template>
                    </p-carousel>
                } @else {
                    <div class="no-image">
                        <span class="no-image-icon">🏠</span>
                        <span>Aucune photo disponible</span>
                    </div>
                }
            </div>

            <!-- 📋 DÉTAILS PROPRIÉTÉ -->
            <div class="property-info">
                <h1 class="property-title">{{ property()!.title }}</h1>
                <p class="property-location">📍 {{ property()!.location }} — {{ property()!.type }}</p>
                
                <!-- ⭐ NOTE MOYENNE -->
                <div class="rating-section" *ngIf="property()">
                    <div class="stars-container">
                        <i *ngFor="let star of getStars(property()?.average_rating || 0)" 
                           class="pi pi-star-fill star-filled"></i>
                        <i *ngFor="let star of getEmptyStars(property()?.average_rating || 0)" 
                           class="pi pi-star star-empty"></i>
                    </div>
                    <span class="rating-text">
                        {{ property()?.average_rating || 0 }} / 5 
                        ({{ property()?.review_count || 0 }} avis)
                    </span>
                </div>

                <p class="property-description">{{ property()!.description }}</p>
                
                <div class="property-meta">
                    <span class="property-type">🏷️ {{ property()!.type }}</span>
                    <span class="property-price">💰 {{ property()!.price }} TND / nuit</span>
                </div>

                <button class="btn-reserve" (click)="openBookingDialog()" *ngIf="!isOwner()">
                    💫 Réserver
                </button>
                <span class="owner-badge" *ngIf="isOwner()">👔 Votre logement</span>
            </div>

            <!-- 📝 SECTION AVIS -->
            <div class="reviews-section">
                <div class="reviews-header">
                    <h2 class="reviews-title">⭐ Avis ({{ reviews.length }})</h2>
                </div>

                <!-- ✍️ FORMULAIRE D'AVIS -->
                @if (canReview) {
                    <div class="review-form">
                        <div class="review-form-header">
                            <span class="form-emoji">✍️</span>
                            <h3>Donnez votre avis</h3>
                        </div>
                        
                        <div class="rating-input">
                            <p-rating [(ngModel)]="newReview.rating" [stars]="5"></p-rating>
                            <span class="rating-label" *ngIf="newReview.rating > 0">
                                {{ getRatingLabel(newReview.rating) }}
                            </span>
                        </div>
                        
                        <textarea pTextarea 
                                  [(ngModel)]="newReview.comment"
                                  rows="3"
                                  placeholder="Partagez votre expérience avec ce logement..."
                                  class="comment-input">
                        </textarea>
                        <button class="btn-submit-review" 
                                (click)="submitReview()"
                                [disabled]="!newReview.rating || !newReview.comment || isSubmitting">
                            <span *ngIf="!isSubmitting">📤 Publier l'avis</span>
                            <span *ngIf="isSubmitting">⏳ Publication...</span>
                        </button>
                    </div>
                }

                <!-- 📋 LISTE DES AVIS -->
                <div class="reviews-list">
                    @for (review of reviews; track review._id) {
                        <div class="review-item">
                            <div class="review-header">
                                <div class="review-user-info">
                                    <span class="review-avatar">{{ getInitials(review.user_email) }}</span>
                                    <div>
                                        <span class="review-user">{{ review.user_email }}</span>
                                        <span class="review-date">📅 {{ review.created_at | date:'dd/MM/yyyy' }}</span>
                                    </div>
                                </div>
                                <div class="review-actions" *ngIf="isMyReview(review)">
                                    <button class="btn-edit-review" (click)="editReview(review)">✏️</button>
                                    <button class="btn-delete-review" (click)="deleteReview(review._id)">🗑️</button>
                                </div>
                            </div>
                            <div class="review-rating">
                                <i *ngFor="let star of getStars(review.rating)" 
                                   class="pi pi-star-fill star-filled"></i>
                                <span class="review-rating-text">{{ review.rating }}/5</span>
                            </div>
                            <p class="review-comment">💬 {{ review.comment }}</p>
                        </div>
                    } @empty {
                        <div class="no-reviews">
                            <span class="no-reviews-emoji">💭</span>
                            <p class="no-reviews-title">Aucun avis pour ce logement</p>
                            <p class="no-reviews-sub">Soyez le premier à donner votre avis ! ✨</p>
                        </div>
                    }
                </div>
            </div>
        </div>

        <!-- 📅 DIALOG DE RÉSERVATION -->
        <p-dialog [header]="'✨ Réserver votre séjour'" [(visible)]="showBookingDialog" [modal]="true" [style]="{ width: '28rem' }">
            <div class="booking-dialog-content">
                <p class="booking-property-title">🏠 {{ property()?.title }}</p>
                <p class="booking-property-location">📍 {{ property()?.location }}</p>
                
                <div class="booking-dates">
                    <div class="date-group">
                        <label class="block mb-2 font-medium">📅 Date d'arrivée</label>
                        <p-datepicker [(ngModel)]="bookingStartDate" [minDate]="today" dateFormat="yy-mm-dd" styleClass="w-full"></p-datepicker>
                    </div>
                    <div class="date-group">
                        <label class="block mb-2 font-medium">📅 Date de départ</label>
                        <p-datepicker [(ngModel)]="bookingEndDate" [minDate]="bookingStartDate || today" dateFormat="yy-mm-dd" styleClass="w-full"></p-datepicker>
                    </div>
                </div>

                <div class="booking-summary" *ngIf="bookingStartDate && bookingEndDate && property()">
                    <p>⏱️ Durée : {{ calculateNights(bookingStartDate, bookingEndDate) }} nuits</p>
                    <p>💰 Total : {{ property()!.price * calculateNights(bookingStartDate, bookingEndDate) }} TND</p>
                </div>

                <button class="btn-confirm-booking" (click)="confirmBooking()" 
                        [disabled]="!bookingStartDate || !bookingEndDate || bookingEndDate <= bookingStartDate">
                    💫 Confirmer la réservation
                </button>
            </div>
        </p-dialog>

        <!-- ✏️ DIALOG D'ÉDITION D'AVIS -->
        <p-dialog [header]="'✏️ Modifier mon avis'" [(visible)]="showEditReviewDialog" [modal]="true" [style]="{ width: '28rem' }">
            <div class="edit-review-content">
                <div class="rating-input">
                    <p-rating [(ngModel)]="editReviewData.rating" [stars]="5"></p-rating>
                </div>
                <textarea pTextarea 
                          [(ngModel)]="editReviewData.comment"
                          rows="3"
                          placeholder="Modifiez votre commentaire..."
                          class="comment-input">
                </textarea>
                <div class="dialog-actions">
                    <button class="btn-cancel" (click)="showEditReviewDialog = false">Annuler</button>
                    <button class="btn-save" (click)="saveEditReview()">💾 Enregistrer</button>
                </div>
            </div>
        </p-dialog>

        <!-- ⏳ LOADING -->
        <ng-template #loading>
            <div class="loading-container">
                <span class="loading-spinner">⏳</span>
                <p>Chargement du logement...</p>
            </div>
        </ng-template>
    `,
    styles: [`
        .property-detail-container {
            max-width: 900px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }

        .property-carousel {
            margin-bottom: 2rem;
        }

        :host ::ng-deep .property-carousel .p-carousel .p-carousel-content .p-carousel-container {
            border-radius: 16px;
            overflow: hidden;
        }

        .carousel-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
        }

        .no-image {
            width: 100%;
            height: 400px;
            background: #f5f5f5;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #888;
            font-size: 1.2rem;
            gap: 1rem;
        }

        .no-image-icon {
            font-size: 4rem;
        }

        .property-info {
            background: white;
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            margin-bottom: 2rem;
        }

        .property-title {
            font-size: 2rem;
            font-weight: 700;
            color: #2d1b69;
            margin: 0 0 0.3rem 0;
        }

        .property-location {
            color: #666;
            margin: 0 0 1rem 0;
        }

        .rating-section {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.8rem 0;
            border-top: 1px solid #f0f0f0;
            border-bottom: 1px solid #f0f0f0;
            margin-bottom: 1rem;
        }

        .stars-container {
            display: flex;
            gap: 0.2rem;
        }

        .star-filled {
            color: #fdcb6e;
            font-size: 1.2rem;
        }

        .star-empty {
            color: #ddd;
            font-size: 1.2rem;
        }

        .rating-text {
            color: #666;
            font-weight: 500;
            font-size: 0.95rem;
        }

        .property-description {
            color: #444;
            line-height: 1.8;
            margin: 1rem 0;
        }

        .property-meta {
            display: flex;
            gap: 1.5rem;
            flex-wrap: wrap;
            margin-bottom: 1.2rem;
        }

        .property-type {
            background: #f0f0f0;
            padding: 0.3rem 1rem;
            border-radius: 50px;
            font-size: 0.9rem;
            color: #666;
        }

        .property-price {
            font-size: 1.3rem;
            font-weight: 700;
            color: #ff6b6b;
        }

        .btn-reserve {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            border: none;
            padding: 0.8rem 2.5rem;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(238,90,36,0.3);
        }

        .btn-reserve:hover {
            transform: scale(1.03);
            box-shadow: 0 6px 25px rgba(238,90,36,0.4);
        }

        .owner-badge {
            display: inline-block;
            background: #dbeafe;
            color: #3b82f6;
            padding: 0.5rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
        }

        .reviews-section {
            background: white;
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .reviews-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .reviews-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2d1b69;
            margin: 0;
        }

        .review-form {
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .review-form-header {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 1rem;
        }

        .form-emoji {
            font-size: 1.5rem;
        }

        .review-form-header h3 {
            margin: 0;
            color: #2d1b69;
        }

        .rating-input {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        :host ::ng-deep .rating-input .p-rating .p-rating-icon {
            font-size: 2rem !important;
            color: #fdcb6e !important;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        :host ::ng-deep .rating-input .p-rating .p-rating-icon:hover {
            transform: scale(1.2);
        }

        .rating-label {
            font-weight: 600;
            color: #2d1b69;
            font-size: 1rem;
        }

        .comment-input {
            width: 100%;
            border-radius: 12px;
            border: 2px solid #e8e8e8;
            padding: 0.8rem 1rem;
            font-family: inherit;
            font-size: 0.95rem;
            resize: vertical;
            margin-bottom: 1rem;
            transition: border-color 0.3s ease;
            min-height: 80px;
        }

        .comment-input:focus {
            border-color: #ff6b6b;
            outline: none;
        }

        .btn-submit-review {
            background: linear-gradient(135deg, #00b894, #00a381);
            border: none;
            padding: 0.7rem 2rem;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-submit-review:hover:not(:disabled) {
            transform: scale(1.03);
            box-shadow: 0 4px 15px rgba(0,184,148,0.3);
        }

        .btn-submit-review:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .reviews-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .review-item {
            padding: 1.2rem 1.5rem;
            border-radius: 16px;
            background: #f8f9fa;
            transition: all 0.3s ease;
        }

        .review-item:hover {
            background: #fef5f7;
        }

        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }

        .review-user-info {
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }

        .review-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
        }

        .review-user {
            font-weight: 600;
            color: #2d1b69;
        }

        .review-date {
            color: #888;
            font-size: 0.8rem;
            display: block;
        }

        .review-actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn-edit-review {
            background: #dbeafe;
            border: none;
            padding: 0.2rem 0.6rem;
            border-radius: 50px;
            color: #3b82f6;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-edit-review:hover {
            background: #3b82f6;
            color: white;
        }

        .btn-delete-review {
            background: #fee2e2;
            border: none;
            padding: 0.2rem 0.6rem;
            border-radius: 50px;
            color: #ef4444;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-delete-review:hover {
            background: #ef4444;
            color: white;
        }

        .review-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .review-rating-text {
            font-weight: 500;
            color: #666;
            font-size: 0.9rem;
        }

        .review-comment {
            color: #444;
            margin: 0.3rem 0 0;
            line-height: 1.6;
        }

        .no-reviews {
            text-align: center;
            padding: 3rem 2rem;
        }

        .no-reviews-emoji {
            font-size: 4rem;
            display: block;
            margin-bottom: 0.5rem;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        .no-reviews-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2d1b69;
            margin: 0.5rem 0;
        }

        .no-reviews-sub {
            color: #888;
            font-size: 1rem;
            margin: 0;
        }

        .booking-dialog-content {
            padding: 0.5rem 0;
        }

        .booking-property-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d1b69;
            margin: 0;
        }

        .booking-property-location {
            color: #666;
            margin: 0 0 1.5rem 0;
        }

        .booking-dates {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1.5rem 0;
        }

        :host ::ng-deep .booking-dates .p-datepicker {
            width: 100% !important;
        }

        .booking-summary {
            background: #f0f7ff;
            padding: 1rem;
            border-radius: 12px;
            margin: 1rem 0;
        }

        .btn-confirm-booking {
            width: 100%;
            padding: 0.8rem;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-confirm-booking:hover:not(:disabled) {
            transform: scale(1.02);
            box-shadow: 0 4px 15px rgba(238,90,36,0.3);
        }

        .btn-confirm-booking:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .edit-review-content {
            padding: 0.5rem 0;
        }

        .dialog-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 1.5rem;
        }

        .btn-cancel {
            padding: 0.5rem 1.5rem;
            border: 2px solid #e0e0e0;
            border-radius: 50px;
            background: white;
            color: #666;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-cancel:hover {
            background: #f5f5f5;
        }

        .btn-save {
            padding: 0.5rem 1.5rem;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-save:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 15px rgba(238,90,36,0.3);
        }

        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 1rem;
        }

        .loading-spinner {
            font-size: 3rem;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* ===== CONFIRM DIALOG STYLES ===== */
        :host ::ng-deep .p-confirm-dialog {
            .p-dialog-content {
                padding: 1.5rem 2rem;
            }
            
            .p-confirm-dialog-message {
                font-size: 1.1rem;
                color: #2d1b69;
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .p-confirm-dialog-icon {
                font-size: 2.5rem;
                color: #ef4444;
            }
            
            .p-dialog-footer {
                padding: 1rem 2rem 1.5rem;
                display: flex;
                justify-content: flex-end;
                gap: 0.8rem;
            }
            
            .p-button {
                border-radius: 50px;
                padding: 0.6rem 2rem;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .p-button-danger {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border: none;
            }
            
            .p-button-danger:hover {
                transform: scale(1.03);
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
            }
            
            .p-button-secondary {
                background: #f5f5f5;
                border: 2px solid #e0e0e0;
                color: #666;
            }
            
            .p-button-secondary:hover {
                background: #e8e8e8;
            }
        }

        @media (max-width: 768px) {
            .property-detail-container {
                padding: 0 1rem;
            }

            .property-info {
                padding: 1.2rem;
            }

            .property-title {
                font-size: 1.5rem;
            }

            .carousel-image {
                height: 250px;
            }

            .reviews-section {
                padding: 1.2rem;
            }

            .review-header {
                flex-direction: column;
                gap: 0.5rem;
            }

            .booking-dates {
                flex-direction: column;
            }

            .property-meta {
                flex-direction: column;
                gap: 0.5rem;
            }
        }

        @media (max-width: 480px) {
            .rating-section {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }

            .dialog-actions {
                flex-direction: column;
            }

            .btn-cancel, .btn-save {
                width: 100%;
                text-align: center;
            }

            .carousel-image {
                height: 200px;
            }
        }
    `]
})
export class PropertyDetail implements OnInit {
    property = signal<Property | null>(null);
    reviews: Review[] = [];
    propertyId: string = '';
    canReview = false;
    isSubmitting = false;

    newReview = {
        rating: 0,
        comment: ''
    };

    showBookingDialog = false;
    bookingStartDate: Date | null = null;
    bookingEndDate: Date | null = null;
    today: Date = new Date();

    showEditReviewDialog = false;
    editReviewData = { rating: 0, comment: '' };
    editingReviewId: string | null = null;

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private propertyService = inject(PropertyService);
    private reviewService = inject(ReviewService);
    private authService = inject(AuthService);
    private bookingService = inject(BookingService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.propertyId = id;
            this.loadProperty(id);
            this.loadReviews(id);
            this.checkCanReview(id);
        }
    }

    loadProperty(id: string) {
        this.propertyService.getById(id).subscribe({
            next: (data) => {
                this.property.set(data);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de charger le logement'
                });
            }
        });
    }

    loadReviews(propertyId: string) {
        this.reviewService.getPropertyReviews(propertyId).subscribe({
            next: (data) => {
                this.reviews = data.reviews || [];
                console.log('📝 Reviews loaded:', this.reviews);
            },
            error: () => {
                // Ignorer l'erreur
            }
        });
    }

    checkCanReview(propertyId: string) {
        if (!this.authService.isLoggedIn()) {
            this.canReview = false;
            return;
        }

        this.bookingService.getMyBookings().subscribe({
            next: (bookings) => {
                const hasConfirmedBooking = bookings.some(
                    b => b.property_id === propertyId && b.status === 'confirmed'
                );
                this.canReview = hasConfirmedBooking;
            },
            error: () => {
                this.canReview = false;
            }
        });
    }

    isOwner(): boolean {
        if (!this.property() || !this.authService.isLoggedIn()) return false;
        return this.property()!.owner_id === this.authService.getUserId();
    }

    isMyReview(review: Review): boolean {
        return review.user_id === this.authService.getUserId();
    }

    getStars(rating: number): number[] {
        return Array(Math.floor(rating)).fill(0);
    }

    getEmptyStars(rating: number): number[] {
        return Array(5 - Math.floor(rating)).fill(0);
    }

    getRatingLabel(rating: number): string {
        const labels: Record<number, string> = {
            1: '😞 Très mauvais',
            2: '😕 Pas top',
            3: '😐 Correct',
            4: '😊 Bien',
            5: '🌟 Excellent !'
        };
        return labels[rating] || '';
    }

    getInitials(email: string): string {
        return email.charAt(0).toUpperCase();
    }

    submitReview() {
        if (!this.property()) return;
        this.isSubmitting = true;

        this.reviewService.createReview(this.property()!._id, this.newReview).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Avis publié !',
                    detail: 'Merci pour votre retour ✨'
                });
                this.newReview = { rating: 0, comment: '' };
                this.loadReviews(this.property()!._id);
                this.loadProperty(this.property()!._id);
                this.canReview = false;
                this.isSubmitting = false;
            },
            error: (err) => {
                this.isSubmitting = false;
                if (err.status === 403) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: '🔐 Réservation requise',
                        detail: 'Vous devez avoir réservé ce logement pour laisser un avis'
                    });
                } else if (err.status === 400) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: '⚠️ Avis déjà existant',
                        detail: 'Vous avez déjà laissé un avis pour ce logement'
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: '😊 Oups !',
                        detail: 'Impossible de publier l\'avis'
                    });
                }
            }
        });
    }

    editReview(review: Review) {
        this.editingReviewId = review._id;
        this.editReviewData = {
            rating: review.rating,
            comment: review.comment
        };
        this.showEditReviewDialog = true;
    }

    saveEditReview() {
        if (!this.editingReviewId) return;

        this.reviewService.updateReview(this.editingReviewId, this.editReviewData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: '✅ Avis modifié !',
                    detail: 'Votre avis a été mis à jour ✨'
                });
                this.showEditReviewDialog = false;
                this.loadReviews(this.propertyId);
                this.loadProperty(this.propertyId);
                this.editingReviewId = null;
                this.editReviewData = { rating: 0, comment: '' };
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de modifier l\'avis'
                });
            }
        });
    }

    deleteReview(reviewId: string) {
        if (!reviewId || reviewId === 'undefined' || reviewId === 'null') {
            console.error('❌ Invalid review ID:', reviewId);
            this.messageService.add({
                severity: 'error',
                summary: '❌ Erreur',
                detail: 'ID de l\'avis invalide'
            });
            return;
        }

        console.log('🗑️ Deleting review with ID:', reviewId);

        this.confirmationService.confirm({
            message: '🗑️ Êtes-vous sûr de vouloir supprimer cet avis ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            acceptButtonStyleClass: 'p-button-danger p-button-raised',
            rejectButtonStyleClass: 'p-button-secondary p-button-raised',
            accept: () => {
                this.reviewService.deleteReview(reviewId).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: '🗑️ Avis supprimé',
                            detail: 'Votre avis a été supprimé avec succès ✨'
                        });
                        this.loadReviews(this.propertyId);
                        this.loadProperty(this.propertyId);
                    },
                    error: (err) => {
                        console.error('❌ Error deleting review:', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: '😊 Oups !',
                            detail: err.error?.detail || 'Impossible de supprimer l\'avis'
                        });
                    }
                });
            },
            reject: () => {
                console.log('Deletion cancelled');
            }
        });
    }

    openBookingDialog() {
        if (!this.authService.isLoggedIn()) {
            this.messageService.add({
                severity: 'warn',
                summary: '🔐 Connexion requise',
                detail: 'Connectez-vous pour réserver'
            });
            this.router.navigate(['/auth/login']);
            return;
        }
        this.showBookingDialog = true;
    }

    calculateNights(start: Date, end: Date): number {
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    confirmBooking() {
        if (!this.property() || !this.bookingStartDate || !this.bookingEndDate) return;

        const nights = this.calculateNights(this.bookingStartDate, this.bookingEndDate);
        
        this.bookingService.create({
            property_id: this.property()!._id,
            start_date: this.bookingStartDate.toISOString(),
            end_date: this.bookingEndDate.toISOString()
        }).subscribe({
            next: () => {
                this.showBookingDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: '🎉 Réservation confirmée !',
                    detail: `Votre séjour de ${nights} nuits a été réservé avec succès ✨`
                });
                this.bookingStartDate = null;
                this.bookingEndDate = null;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: '😊 Oups !',
                    detail: 'Impossible de réserver ce logement'
                });
            }
        });
    }
}