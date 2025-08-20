import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SnippetService } from '../../../services/snippet.service';
import { Snippet } from '../../../models/snippet.model';

declare var Prism: any;

@Component({
  selector: 'app-snippet-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3 mb-1">My Code Snippets</h1>
              <p class="text-muted mb-0">Manage and organize your code snippets</p>
            </div>
            <a routerLink="/snippets/new" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>New Snippet
            </a>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search snippets by title, language, or tags..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
            >
          </div>
        </div>
        <div class="col-md-4">
          <select class="form-select" [(ngModel)]="selectedLanguage" (change)="onLanguageFilter()">
            <option value="">All Languages</option>
            <option *ngFor="let lang of availableLanguages" [value]="lang">{{ lang }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading your snippets...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredSnippets.length === 0 && !searchQuery" 
           class="text-center py-5">
        <i class="bi bi-file-code text-muted" style="font-size: 4rem;"></i>
        <h4 class="mt-3 text-muted">No snippets yet</h4>
        <p class="text-muted">Create your first code snippet to get started!</p>
        <a routerLink="/snippets/new" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i>Create Your First Snippet
        </a>
      </div>

      <!-- No Search Results -->
      <div *ngIf="!isLoading && filteredSnippets.length === 0 && searchQuery" 
           class="text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 4rem;"></i>
        <h4 class="mt-3 text-muted">No results found</h4>
        <p class="text-muted">Try adjusting your search terms or filters</p>
        <button class="btn btn-outline-primary" (click)="clearSearch()">
          <i class="bi bi-x-circle me-2"></i>Clear Search
        </button>
      </div>

      <!-- Snippets Grid -->
      <div *ngIf="!isLoading && filteredSnippets.length > 0" class="row">
        <div class="col-lg-6 col-xl-4 mb-4" *ngFor="let snippet of filteredSnippets">
          <div class="card h-100 snippet-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 text-truncate me-2">{{ snippet.title }}</h6>
              <span class="badge bg-primary">{{ snippet.language }}</span>
            </div>
            <div class="card-body">
              <p class="text-muted small mb-3" *ngIf="snippet.description">
                {{ snippet.description }}
              </p>
              
              <!-- Code Preview -->
              <div class="code-preview mb-3">
                <pre class="language-{{ snippet.language }}"><code [innerHTML]="getHighlightedCode(snippet.code, snippet.language)"></code></pre>
              </div>

              <!-- Tags -->
              <div class="mb-3" *ngIf="snippet.tags">
                <span class="badge bg-light text-dark me-1" 
                      *ngFor="let tag of getTagsArray(snippet.tags)">
                  {{ tag }}
                </span>
              </div>

              <!-- Metadata -->
              <div class="d-flex justify-content-between align-items-center text-muted small">
                <span>
                  <i class="bi bi-calendar3 me-1"></i>
                  {{ formatDate(snippet.createdAt) }}
                </span>
                <span *ngIf="snippet.updatedAt && snippet.updatedAt !== snippet.createdAt">
                  <i class="bi bi-pencil me-1"></i>
                  {{ formatDate(snippet.updatedAt) }}
                </span>
              </div>
            </div>
            <div class="card-footer bg-transparent">
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group" role="group">
                  <button class="btn btn-sm btn-outline-primary" 
                          (click)="copyToClipboard(snippet.code)"
                          title="Copy to clipboard">
                    <i class="bi bi-clipboard"></i>
                  </button>
                  <a [routerLink]="['/snippets/edit', snippet.id]" 
                     class="btn btn-sm btn-outline-success"
                     title="Edit snippet">
                    <i class="bi bi-pencil"></i>
                  </a>
                </div>
                <button class="btn btn-sm btn-outline-danger" 
                        (click)="deleteSnippet(snippet)"
                        title="Delete snippet">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div *ngIf="!isLoading && filteredSnippets.length > 0" class="row mt-4">
        <div class="col-12">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Showing {{ filteredSnippets.length }} of {{ allSnippets.length }} snippets
            <span *ngIf="searchQuery || selectedLanguage">
              (filtered by: 
              <span *ngIf="searchQuery">"{{ searchQuery }}"</span>
              <span *ngIf="searchQuery && selectedLanguage">, </span>
              <span *ngIf="selectedLanguage">{{ selectedLanguage }}</span>)
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .snippet-card {
      transition: all 0.3s ease;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .snippet-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .code-preview {
      max-height: 200px;
      overflow: hidden;
      position: relative;
    }
    
    .code-preview pre {
      margin: 0;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.4;
    }
    
    .code-preview::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      background: linear-gradient(transparent, rgba(255,255,255,0.9));
    }
    
    .input-group-text {
      background-color: #f8f9fa;
      border-right: none;
    }
    
    .form-control {
      border-left: none;
    }
    
    .form-control:focus {
      box-shadow: none;
      border-color: #6366f1;
    }
    
    .badge {
      font-size: 0.75rem;
    }
    
    .btn-group .btn {
      border-radius: 0;
    }
    
    .btn-group .btn:first-child {
      border-top-left-radius: 0.375rem;
      border-bottom-left-radius: 0.375rem;
    }
    
    .btn-group .btn:last-child {
      border-top-right-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }
  `]
})
export class SnippetListComponent implements OnInit {
  allSnippets: Snippet[] = [];
  filteredSnippets: Snippet[] = [];
  availableLanguages: string[] = [];
  searchQuery = '';
  selectedLanguage = '';
  isLoading = true;

  constructor(private snippetService: SnippetService) {}

  ngOnInit(): void {
    this.loadSnippets();
  }

  loadSnippets(): void {
    this.isLoading = true;
    this.snippetService.getAllSnippets().subscribe({
      next: (snippets) => {
        this.allSnippets = snippets;
        this.filteredSnippets = snippets;
        this.extractLanguages();
        this.isLoading = false;
        
        // Highlight code after DOM update
        setTimeout(() => {
          if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error loading snippets:', error);
        this.isLoading = false;
      }
    });
  }

  extractLanguages(): void {
    const languages = [...new Set(this.allSnippets.map(s => s.language))];
    this.availableLanguages = languages.sort();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onLanguageFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.allSnippets;

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(snippet =>
        snippet.title.toLowerCase().includes(query) ||
        snippet.language.toLowerCase().includes(query) ||
        (snippet.tags && snippet.tags.toLowerCase().includes(query)) ||
        (snippet.description && snippet.description.toLowerCase().includes(query))
      );
    }

    // Apply language filter
    if (this.selectedLanguage) {
      filtered = filtered.filter(snippet => snippet.language === this.selectedLanguage);
    }

    this.filteredSnippets = filtered;
    
    // Re-highlight code
    setTimeout(() => {
      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
    }, 100);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedLanguage = '';
    this.applyFilters();
  }

  getHighlightedCode(code: string, language: string): string {
    if (typeof Prism !== 'undefined' && Prism.languages[language]) {
      return Prism.highlight(code, Prism.languages[language], language);
    }
    return code;
  }

  getTagsArray(tags: string): string[] {
    return tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }

  copyToClipboard(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      // You could add a toast notification here
      console.log('Code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  }

  deleteSnippet(snippet: Snippet): void {
    if (confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      this.snippetService.deleteSnippet(snippet.id!).subscribe({
        next: () => {
          this.loadSnippets();
        },
        error: (error) => {
          console.error('Error deleting snippet:', error);
          alert('Failed to delete snippet. Please try again.');
        }
      });
    }
  }
}