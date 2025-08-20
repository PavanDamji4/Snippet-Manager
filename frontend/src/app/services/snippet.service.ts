import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Snippet, SnippetStatistics } from '../models/snippet.model';

@Injectable({
  providedIn: 'root'
})
export class SnippetService {
  private readonly API_URL = 'http://localhost:8080/api/snippets';

  constructor(private http: HttpClient) { }

  getAllSnippets(): Observable<Snippet[]> {
    return this.http.get<Snippet[]>(this.API_URL);
  }

  getSnippetById(id: number): Observable<Snippet> {
    return this.http.get<Snippet>(`${this.API_URL}/${id}`);
  }

  createSnippet(snippet: Snippet): Observable<Snippet> {
    return this.http.post<Snippet>(this.API_URL, snippet);
  }

  updateSnippet(id: number, snippet: Snippet): Observable<Snippet> {
    return this.http.put<Snippet>(`${this.API_URL}/${id}`, snippet);
  }

  deleteSnippet(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  searchSnippets(query: string): Observable<Snippet[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Snippet[]>(`${this.API_URL}/search`, { params });
  }

  getStatistics(): Observable<SnippetStatistics> {
    return this.http.get<SnippetStatistics>(`${this.API_URL}/statistics`);
  }
}