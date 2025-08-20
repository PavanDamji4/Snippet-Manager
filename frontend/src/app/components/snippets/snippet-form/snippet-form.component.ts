import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SnippetService } from '../../../services/snippet.service';
import { Snippet } from '../../../models/snippet.model';

declare var Prism: any;

@Component({
  selector: 'app-snippet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3 mb-1">{{ isEditMode ? 'Edit' : 'Create New' }} Snippet</h1>
              <p class="text-muted mb-0">{{ isEditMode ? 'Update your' : 'Add a new' }} code snippet</p>
            </div>
            <button class="btn btn-outline-secondary" (click)="goBack()">
              <i class="bi bi-arrow-left me-2"></i>Back
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-file-code me-2"></i>Snippet Details
              </h5>
            </div>
            <div class="card-body">
              <form [formGroup]="snippetForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-8 mb-3">
                    <label for="title" class="form-label">Title *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="title"
                      formControlName="title"
                      [class.is-invalid]="snippetForm.get('title')?.invalid && snippetForm.get('title')?.touched"
                      placeholder="Enter snippet title"
                    >
                    <div class="invalid-feedback" *ngIf="snippetForm.get('title')?.invalid && snippetForm.get('title')?.touched">
                      Title is required
                    </div>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="language" class="form-label">Language *</label>
                    <select
                      class="form-select"
                      id="language"
                      formControlName="language"
                      [class.is-invalid]="snippetForm.get('language')?.invalid && snippetForm.get('language')?.touched"
                      (change)="onLanguageChange()"
                    >
                      <option value="">Select Language</option>
                      <option *ngFor="let lang of availableLanguages" [value]="lang.value">
                        {{ lang.label }}
                      </option>
                    </select>
                    <div class="invalid-feedback" *ngIf="snippetForm.get('language')?.invalid && snippetForm.get('language')?.touched">
                      Language is required
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    formControlName="description"
                    rows="2"
                    placeholder="Brief description of what this code does"
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="tags" class="form-label">Tags</label>
                  <input
                    type="text"
                    class="form-control"
                    id="tags"
                    formControlName="tags"
                    placeholder="algorithm, sorting, javascript (comma-separated)"
                  >
                  <div class="form-text">Separate tags with commas</div>
                </div>

                <div class="mb-4">
                  <label for="code" class="form-label">Code *</label>
                  <textarea
                    class="form-control code-editor"
                    id="code"
                    formControlName="code"
                    [class.is-invalid]="snippetForm.get('code')?.invalid && snippetForm.get('code')?.touched"
                    rows="15"
                    placeholder="Paste your code here..."
                    (input)="onCodeChange()"
                  ></textarea>
                  <div class="invalid-feedback" *ngIf="snippetForm.get('code')?.invalid && snippetForm.get('code')?.touched">
                    Code is required
                  </div>
                </div>

                <div class="d-flex justify-content-between">
                  <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
                    <i class="bi bi-x-circle me-2"></i>Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="snippetForm.invalid || isLoading"
                  >
                    <span class="spinner-border spinner-border-sm me-2" *ngIf="isLoading"></span>
                    <i class="bi bi-check-circle me-2" *ngIf="!isLoading"></i>
                    {{ isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }} Snippet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-eye me-2"></i>Preview
              </h5>
            </div>
            <div class="card-body">
              <div *ngIf="!snippetForm.get('code')?.value" class="text-center py-4">
                <i class="bi bi-code-slash text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted mt-2 mb-0">Code preview will appear here</p>
              </div>

              <div *ngIf="snippetForm.get('code')?.value">
                <div class="mb-3">
                  <h6 class="mb-2">{{ snippetForm.get('title')?.value || 'Untitled Snippet' }}</h6>
                  <span class="badge bg-primary" *ngIf="snippetForm.get('language')?.value">
                    {{ getLanguageLabel(snippetForm.get('language')?.value) }}
                  </span>
                </div>

                <div class="code-preview">
                  <pre class="language-{{ snippetForm.get('language')?.value || 'text' }}"><code [innerHTML]="getHighlightedCode()"></code></pre>
                </div>

                <div class="mt-3" *ngIf="snippetForm.get('tags')?.value">
                  <small class="text-muted">Tags:</small><br>
                  <span class="badge bg-light text-dark me-1" 
                        *ngFor="let tag of getTagsArray()">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tips Card -->
          <div class="card mt-4">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bi bi-lightbulb me-2"></i>Tips
              </h6>
            </div>
            <div class="card-body">
              <ul class="list-unstyled mb-0 small">
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Use descriptive titles for easy searching
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Add relevant tags to categorize snippets
                </li>
                <li class="mb-2">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Include comments in your code for clarity
                </li>
                <li class="mb-0">
                  <i class="bi bi-check-circle text-success me-2"></i>
                  Select the correct language for syntax highlighting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .code-editor {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      resize: vertical;
    }
    
    .code-preview {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #dee2e6;
      border-radius: 6px;
    }
    
    .code-preview pre {
      margin: 0;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.4;
    }
    
    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-control:focus,
    .form-select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
    }
    
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
  `]
})
export class SnippetFormComponent implements OnInit {
  snippetForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  snippetId: number | null = null;

  availableLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'text', label: 'Plain Text' }
  ];

  constructor(
    private fb: FormBuilder,
    private snippetService: SnippetService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.snippetForm = this.fb.group({
      title: ['', [Validators.required]],
      code: ['', [Validators.required]],
      language: ['', [Validators.required]],
      description: [''],
      tags: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.snippetId = +id;
      this.loadSnippet();
    }
  }

  loadSnippet(): void {
    if (this.snippetId) {
      this.snippetService.getSnippetById(this.snippetId).subscribe({
        next: (snippet) => {
          this.snippetForm.patchValue({
            title: snippet.title,
            code: snippet.code,
            language: snippet.language,
            description: snippet.description || '',
            tags: snippet.tags || ''
          });
          this.highlightCode();
        },
        error: (error) => {
          console.error('Error loading snippet:', error);
          this.router.navigate(['/snippets']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.snippetForm.valid) {
      this.isLoading = true;
      const snippetData: Snippet = this.snippetForm.value;

      const operation = this.isEditMode
        ? this.snippetService.updateSnippet(this.snippetId!, snippetData)
        : this.snippetService.createSnippet(snippetData);

      operation.subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/snippets']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving snippet:', error);
          alert('Failed to save snippet. Please try again.');
        }
      });
    }
  }

  onLanguageChange(): void {
    this.highlightCode();
  }

  onCodeChange(): void {
    this.highlightCode();
  }

  highlightCode(): void {
    setTimeout(() => {
      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
    }, 100);
  }

  getHighlightedCode(): string {
    const code = this.snippetForm.get('code')?.value || '';
    const language = this.snippetForm.get('language')?.value || 'text';
    
    if (typeof Prism !== 'undefined' && Prism.languages[language]) {
      return Prism.highlight(code, Prism.languages[language], language);
    }
    return code;
  }

  getLanguageLabel(value: string): string {
    const lang = this.availableLanguages.find(l => l.value === value);
    return lang ? lang.label : value;
  }

  getTagsArray(): string[] {
    const tags = this.snippetForm.get('tags')?.value || '';
    return tags ? tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
  }

  goBack(): void {
    this.router.navigate(['/snippets']);
  }
}