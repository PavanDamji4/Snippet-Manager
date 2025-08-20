import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SnippetService } from '../../services/snippet.service';
import { AuthService } from '../../services/auth.service';
import { Snippet, SnippetStatistics } from '../../models/snippet.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3 mb-1">Welcome back, {{ currentUser?.fullName }}!</h1>
              <p class="text-muted mb-0">Manage your code snippets efficiently</p>
            </div>
            <a routerLink="/snippets/new" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>New Snippet
            </a>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card bg-primary text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-0">{{ statistics?.totalSnippets || 0 }}</h4>
                  <p class="mb-0">Total Snippets</p>
                </div>
                <i class="bi bi-file-code" style="font-size: 2rem; opacity: 0.7;"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-0">{{ getLanguageCount() }}</h4>
                  <p class="mb-0">Languages</p>
                </div>
                <i class="bi bi-code-slash" style="font-size: 2rem; opacity: 0.7;"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card bg-info text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-0">{{ getMostUsedLanguage() }}</h4>
                  <p class="mb-0">Top Language</p>
                </div>
                <i class="bi bi-star" style="font-size: 2rem; opacity: 0.7;"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="mb-0">{{ recentSnippets.length }}</h4>
                  <p class="mb-0">Recent</p>
                </div>
                <i class="bi bi-clock-history" style="font-size: 2rem; opacity: 0.7;"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Recent Snippets -->
        <div class="col-lg-8 mb-4">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-clock-history me-2"></i>Recent Snippets
              </h5>
              <a routerLink="/snippets" class="btn btn-sm btn-outline-primary">View All</a>
            </div>
            <div class="card-body">
              <div *ngIf="isLoading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <div *ngIf="!isLoading && recentSnippets.length === 0" class="text-center py-4">
                <i class="bi bi-file-code text-muted" style="font-size: 3rem;"></i>
                <h6 class="mt-3 text-muted">No snippets yet</h6>
                <p class="text-muted">Create your first code snippet to get started!</p>
                <a routerLink="/snippets/new" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-2"></i>Create Snippet
                </a>
              </div>

              <div *ngIf="!isLoading && recentSnippets.length > 0">
                <div class="row">
                  <div class="col-md-6 mb-3" *ngFor="let snippet of recentSnippets">
                    <div class="card border-0 bg-light h-100">
                      <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <h6 class="card-title mb-0">{{ snippet.title }}</h6>
                          <span class="badge bg-primary">{{ snippet.language }}</span>
                        </div>
                        <p class="card-text text-muted small mb-2">
                          {{ snippet.description || 'No description' }}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">
                            <i class="bi bi-calendar3 me-1"></i>
                            {{ formatDate(snippet.createdAt) }}
                          </small>
                          <a [routerLink]="['/snippets/edit', snippet.id]" 
                             class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-pencil"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Language Statistics -->
        <div class="col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-bar-chart me-2"></i>Language Statistics
              </h5>
            </div>
            <div class="card-body">
              <div *ngIf="!statistics?.languageStatistics || getLanguageEntries().length === 0" 
                   class="text-center py-4">
                <i class="bi bi-pie-chart text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted mt-2 mb-0">No data available</p>
              </div>

              <div *ngIf="statistics?.languageStatistics && getLanguageEntries().length > 0">
                <div class="mb-3" *ngFor="let entry of getLanguageEntries()">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-medium">{{ entry.language }}</span>
                    <span class="text-muted">{{ entry.count }}</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-primary" 
                         [style.width.%]="(entry.count / statistics!.totalSnippets) * 100">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-lightning me-2"></i>Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 col-sm-6 mb-3">
                  <a routerLink="/snippets/new" class="btn btn-outline-primary w-100 py-3">
                    <i class="bi bi-plus-circle d-block mb-2" style="font-size: 1.5rem;"></i>
                    Create New Snippet
                  </a>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <a routerLink="/snippets" class="btn btn-outline-success w-100 py-3">
                    <i class="bi bi-list-ul d-block mb-2" style="font-size: 1.5rem;"></i>
                    View All Snippets
                  </a>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <button class="btn btn-outline-info w-100 py-3" (click)="loadData()">
                    <i class="bi bi-arrow-clockwise d-block mb-2" style="font-size: 1.5rem;"></i>
                    Refresh Data
                  </button>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <button class="btn btn-outline-warning w-100 py-3" disabled>
                    <i class="bi bi-download d-block mb-2" style="font-size: 1.5rem;"></i>
                    Export (Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: all 0.3s ease;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .progress {
      border-radius: 3px;
    }
    
    .btn-outline-primary:hover,
    .btn-outline-success:hover,
    .btn-outline-info:hover,
    .btn-outline-warning:hover {
      transform: translateY(-1px);
    }
    
    .bg-primary { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important; }
    .bg-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; }
    .bg-info { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important; }
    .bg-warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  statistics: SnippetStatistics | null = null;
  recentSnippets: Snippet[] = [];
  isLoading = true;

  constructor(
    private snippetService: SnippetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Load statistics
    this.snippetService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });

    // Load recent snippets
    this.snippetService.getAllSnippets().subscribe({
      next: (snippets) => {
        this.recentSnippets = snippets.slice(0, 6); // Get first 6 snippets
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading snippets:', error);
        this.isLoading = false;
      }
    });
  }

  getLanguageCount(): number {
    if (!this.statistics?.languageStatistics) return 0;
    return Object.keys(this.statistics.languageStatistics).length;
  }

  getMostUsedLanguage(): string {
    if (!this.statistics?.languageStatistics) return 'N/A';
    
    const entries = Object.entries(this.statistics.languageStatistics);
    if (entries.length === 0) return 'N/A';
    
    const sorted = entries.sort(([,a], [,b]) => b - a);
    return sorted[0][0];
  }

  getLanguageEntries(): { language: string, count: number }[] {
    if (!this.statistics?.languageStatistics) return [];
    
    return Object.entries(this.statistics.languageStatistics)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }
}