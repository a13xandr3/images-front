import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Ibody {
  path: string;
  recursive: boolean;
  filter: string;
  similarity_threshold: number;
  page: number;
  page_size: number;
  analyze: boolean
}
export interface ImageItem {
  id: string;
  path: string;
  content_url: string;
  size: number;
  checksum: string | null;
  equal: boolean;
  similar: boolean;
  exact_group: string | null;
  similarity_group: string | null;
  exact_count: number;
  similarity_count: number;
}
export interface LoadImagesResponse {
  root_path: string;
  filter: string;
  analysis_complete: boolean;
  total: number;
  count: number;
  filtered_count: number;
  page: number;
  page_size: number;
  pages: number;
  before: number;
  after: number;
  returned: number;
  images: ImageItem[];
  errors: unknown[];
}
@Injectable({
  providedIn: 'root',
})
export class Images {
  private path: string = 'http://localhost:8000';
  private http = inject(HttpClient);
  private readonly requestOptions = {
    headers: new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  }
  private _body: Ibody = {
    "path": "/Volumes/BackupMedia/Familia-Busca-Pe/Marias/Marias",
    "recursive": true,
    "filter": "all",
    "similarity_threshold": 9,
    "page": 1,
    "page_size": 10,
    "analyze": false    
  }
  imagesLoad(page: number): Observable<LoadImagesResponse> {
    const body: Ibody = {
      ...this._body,
      page,
    };
    return this.http.post<LoadImagesResponse>(
      `${this.path}/api/images/load`,
      body,
      this.requestOptions,
    );
  }
  imageLoad(idImage: string): Observable<Blob> {
    return this.http.get(`${this.path}/api/images/content/${encodeURIComponent(idImage)}`, {
      headers: new HttpHeaders({ Accept: 'image/*' }),
      responseType: 'blob',
    });
  }
  
  imageDelete(idImage: string, root_path: string, path: string): Observable<any> {
    const requestBody = {
      idFile: Number(idImage),
      root_path,
      path,
    };
    return this.http.delete(`${this.path}/api/images`, {
      ...this.requestOptions,
      body: requestBody,
    });
  }
  
}
