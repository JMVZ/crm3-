import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, finalize, tap, catchError, throwError, map } from 'rxjs';
import { AuthService } from '../../auth';
import { URL_SERVICIOS } from 'src/app/config/config';
import { environment } from 'src/environments/environment';

interface ProductResponse {
  data: any[];
  products?: {
    data: any[];
  };
}

interface Category {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  data?: T;
  message: string;
  message_text: string;
  debug?: {
    headers: any;
    data: any;
    files: any;
    warehouses: any;
    wallets: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;
  
  constructor(
    private http: HttpClient,
    public authservice: AuthService,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  registerProduct(data: FormData): Observable<ApiResponse<any>> {
    this.isLoadingSubject.next(true);
    let headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authservice.token
    });

    // Crear un nuevo FormData para procesar los datos
    const processedFormData = new FormData();

    // Procesar cada campo
    data.forEach((value, key) => {
      if (key === 'WAREHOUSES_PRODUCT' || key === 'WALLETS_PRODUCT') {
        // Asegurarse de que los campos JSON sean strings válidos
        try {
          const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
          processedFormData.append(key, jsonValue);
        } catch (e) {
          console.error(`Error procesando ${key}:`, e);
          processedFormData.append(key, value);
        }
      } else if (key === 'product_imagen') {
        // Mantener la imagen como está
        processedFormData.append(key, value);
      } else {
        // Convertir otros campos a string
        processedFormData.append(key, value.toString());
      }
    });

    console.log('FormData procesado:');
    processedFormData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    return this.http.post<ApiResponse<any>>(`${URL_SERVICIOS}/products`, processedFormData, {
      headers: headers,
      reportProgress: true,
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('Respuesta del servidor:', response);
      }),
      catchError(error => {
        console.error('Error en la petición:', error);
        if (error.error) {
          console.error('Detalles del error:', error.error);
          if (error.error.errors) {
            console.error('Errores de validación:', error.error.errors);
          }
        }
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  importProduct(data:any) {
    this.isLoadingSubject.next(true);
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    let URL = URL_SERVICIOS+"/products/import";
    return this.http.post(URL,data,{headers: headers}).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  listProducts(page: number = 1, params: any = {}): Observable<any> {
    console.log('Cargando productos con parámetros:', { page, ...params });
    
    // Configurar los parámetros de la petición
    const requestParams = { 
      page, 
      ...params,
      per_page: 1000,
      all: true,
      paginate: false
    };
    
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    
    // Usar el endpoint /products con GET
    return this.http.get(`${URL_SERVICIOS}/products`, {
      headers: headers,
      params: requestParams
    }).pipe(
      tap((response: any) => {
        console.log('Respuesta del servidor:', response);
        if (response?.products?.data) {
          console.log('Número de productos cargados:', response.products.data.length);
          console.log('Total de productos en el sistema:', response.products.total);
          console.log('Productos agotados:', response.num_products_agotado);
          console.log('Productos por agotar:', response.num_products_por_agotar);
        } else {
          console.log('Respuesta sin datos:', response);
        }
      }),
      catchError(error => {
        console.error('Error al cargar productos:', error);
        return throwError(() => error);
      })
    );
  }

  showProduct(PRODUCT_ID:string){
    this.isLoadingSubject.next(true);
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    let URL = URL_SERVICIOS+"/products/"+PRODUCT_ID;
    return this.http.get(URL,{headers: headers}).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  configAll(){
    this.isLoadingSubject.next(true);
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    let URL = URL_SERVICIOS+"/products/config";
    return this.http.get(URL,{headers: headers}).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateProduct(ID_PRODUCT:string,data:any) {
    this.isLoadingSubject.next(true);
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    let URL = URL_SERVICIOS+"/products/"+ID_PRODUCT;
    return this.http.post(URL,data,{headers: headers}).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteProduct(ID_PRODUCT:string) {
    this.isLoadingSubject.next(true);
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    let URL = URL_SERVICIOS+"/products/"+ID_PRODUCT;
    return this.http.delete(URL,{headers: headers}).pipe(
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  getAllProducts() {
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    let URL = URL_SERVICIOS+"/products";
    return this.http.get(URL,{headers: headers});
  }

  getProformasPendientes(): Observable<any[]> {
    this.isLoadingSubject.next(true);
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    let URL = URL_SERVICIOS+"/proformas?state_proforma=1&all=true";
    console.log('Obteniendo proformas pendientes de:', URL);
    return this.http.get<any[]>(URL, {headers: headers}).pipe(
      tap((response: any) => {
        console.log('Respuesta de proformas pendientes:', response);
        if (response && response.data) {
          console.log('Número de proformas encontradas:', response.data.length);
        } else {
          console.log('Respuesta sin datos:', response);
        }
      }),
      catchError(error => {
        console.error('Error al obtener proformas pendientes:', error);
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    this.isLoadingSubject.next(true);
    let headers = new HttpHeaders({'Authorization': 'Bearer '+ this.authservice.token});
    return this.http.get<any>(`${URL_SERVICIOS}/product_categories`, {headers: headers}).pipe(
      map(response => {
        return {
          data: response.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name
          })),
          message: '200',
          message_text: 'Categorías obtenidas exitosamente'
        } as ApiResponse<Category[]>;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

}
