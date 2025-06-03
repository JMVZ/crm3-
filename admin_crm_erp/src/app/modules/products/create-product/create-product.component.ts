import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductsService } from '../service/products.service';
import { Router } from '@angular/router';

interface WarehouseProduct {
  unit: {
    id: string | number;
  };
  warehouse: {
    id: string | number;
  };
  quantity: number;
}

interface WalletProduct {
  unit: {
    id: string | number;
  };
  sucursale?: {
    id: string | number;
  };
  client_segment?: {
    id: string | number;
  };
  price_general: number;
}

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {
  is_discount: number = 1;
  tab_selected: number = 1;
  imagen_product: any;
  imagen_previzualiza = 'assets/media/avatars/blank.png';
  isLoading$: any;

  // SECTION WAREHOUSES
  almacen_warehouse: string = '';
  unit_warehouse: string = '';
  quantity_warehouse: number = 0;
  WAREHOUSES_PRODUCT: any = [];
  
  // SECTION PRICE MULTIPLES  
  unit_price_multiple: string = '';
  sucursale_price_multiple: string = '';
  client_segment_price_multiple: string = '';
  quantity_price_multiple: number = 0;
  WALLETS_PRODUCT: any = [];

  WAREHOUSES: any = [];
  SUCURSALES: any = [];
  UNITS: any = [];
  CLIENT_SEGMENTS: any = [];
  CATEGORIES: any = [];

  // FORM FIELDS
  title: string = '';
  description: string = '';
  sku: string = '';
  price_general: number = 0;
  weight: number = 0;
  width: number = 0;
  height: number = 0;
  length: number = 0;
  state: string = '1';
  product_categorie_id: string = '';
  tax_selected: string = '1';
  importe_iva: number = 0;
  disponiblidad: string = '1';
  tiempo_de_abastecimiento: number = 0;
  umbral: string = '';
  umbral_unit_id: string = '';
  min_discount: number = 0;
  max_discount: number = 0;

  constructor(
    public toast: ToastrService,
    public productService: ProductsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.productService.isLoading$;
    this.loadCategories();

    // Cargar imagen predeterminada
    fetch('assets/media/avatars/blank.png')
      .then(response => response.blob())
      .then(blob => {
        this.imagen_product = new File([blob], 'default-image.png', { type: 'image/png' });
      });

    this.productService.configAll().subscribe((resp:any) => {
      this.WAREHOUSES = resp.almacens;
      this.SUCURSALES = resp.sucursales;
      this.UNITS = resp.units;
      this.CLIENT_SEGMENTS = resp.segments_clients;
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (response) => {
        if (response.data && Array.isArray(response.data)) {
          this.CATEGORIES = response.data;
        } else {
          this.toast.error('Error al cargar las categorías', 'Error');
          console.error('Formato de respuesta inválido:', response);
        }
      },
      error: (error) => {
        this.toast.error('Error al cargar las categorías', 'Error');
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  addWarehouse(){
    if(!this.almacen_warehouse ||
      ! this.unit_warehouse  ||
      ! this.quantity_warehouse
    ){
      this.toast.error("VALIDACIÓN","Necesitas seleccionar un almacen y una unidad, aparte de colocar una cantidad");
      return;
    }

    let UNIT_SELECTED = this.UNITS.find((unit:any) => unit.id == this.unit_warehouse);
    let WAREHOUSE_SELECTED = this.WAREHOUSES.find((wareh:any) => wareh.id == this.almacen_warehouse);


    let INDEX_WAREHOUSE = this.WAREHOUSES_PRODUCT.findIndex((wh_prod:any) => (wh_prod.unit.id == this.unit_warehouse)
                                                                              && (wh_prod.warehouse.id == this.almacen_warehouse));

    if(INDEX_WAREHOUSE != -1){
      this.toast.error("VALIDACIÓN","La existencia de ese producto con el almacen y la unidad ya existe");
      return;
    }
    this.WAREHOUSES_PRODUCT.push({
      unit: UNIT_SELECTED,
      warehouse: WAREHOUSE_SELECTED,
      quantity: this.quantity_warehouse,
    });
    this.almacen_warehouse = ''
    this.unit_warehouse = ''
    this.quantity_warehouse = 0
    console.log(this.WAREHOUSES_PRODUCT);
  }

  removeWarehouse(WAREHOUSES_PROD:any){
    // EL OBJETO QUE QUIERO ELIMINAR
    // LA LISTA DONDE SE ENCUENTRA EL OBJECTO QUE QUIERO ELIMINAR
    //  OBTENER LA POSICIÓN DEL ELEMENTO A ELIMINAR
    let INDEX_WAREHOUSE = this.WAREHOUSES_PRODUCT.findIndex((wh_prod:any) => (wh_prod.unit.id == WAREHOUSES_PROD.unit.id)
      && (wh_prod.warehouse.id == WAREHOUSES_PROD.warehouse.id));
    //  LA ELIMINACIÓN DEL OBJECTO
    if(INDEX_WAREHOUSE != -1){
      this.WAREHOUSES_PRODUCT.splice(INDEX_WAREHOUSE,1);
    }
  }

  addPriceMultiple(){
    if(!this.unit_price_multiple ||
      ! this.quantity_price_multiple
    ){
      this.toast.error("VALIDACIÓN","Necesitas seleccionar una unidad, aparte de colocar un precio");
      return;
    }
    // unit_price_multiple
    // sucursale_price_multiple
    // client_segment_price_multiple
    // quantity_price_multiple
    let UNIT_SELECTED = this.UNITS.find((unit:any) => unit.id == this.unit_price_multiple);
    let SUCURSALE_SELECTED = this.SUCURSALES.find((sucurs:any) => sucurs.id == this.sucursale_price_multiple);
    let CLIENT_SEGMENT_SELECTED = this.CLIENT_SEGMENTS.find((clisg:any) => clisg.id == this.client_segment_price_multiple);
    
    let INDEX_PRICE_MULTIPLE = this.WALLETS_PRODUCT.findIndex((wh_prod:any) => 
                          (wh_prod.unit.id == this.unit_price_multiple)
                          && (wh_prod.sucursale_price_multiple == this.sucursale_price_multiple)
                          && (wh_prod.client_segment_price_multiple == this.client_segment_price_multiple));

    if(INDEX_PRICE_MULTIPLE != -1){
      this.toast.error("VALIDACIÓN","El precio de ese producto con la sucursal y unidad ya existe");
      return;
    }

    this.WALLETS_PRODUCT.push({
      unit: UNIT_SELECTED,
      sucursale: SUCURSALE_SELECTED,
      client_segment: CLIENT_SEGMENT_SELECTED,
      price_general: this.quantity_price_multiple,
      sucursale_price_multiple: this.sucursale_price_multiple,
      client_segment_price_multiple: this.client_segment_price_multiple,
    });
    this.quantity_price_multiple = 0;
    this.sucursale_price_multiple = ''
    this.client_segment_price_multiple = '';
    this.unit_price_multiple = '';

    console.log(this.WALLETS_PRODUCT);
  }

  removePriceMultiple(WALLETS_PROD:any){
    // EL OBJETO QUE QUIERO ELIMINAR
    // LA LISTA DONDE SE ENCUENTRA EL OBJECTO QUE QUIERO ELIMINAR
    //  OBTENER LA POSICIÓN DEL ELEMENTO A ELIMINAR
    let INDEX_WAREHOUSE = this.WALLETS_PRODUCT.findIndex((wh_prod:any) => 
      (wh_prod.unit.id == WALLETS_PROD.unit.id)
      && (wh_prod.sucursale_price_multiple == WALLETS_PROD.sucursale_price_multiple)
      && (wh_prod.client_segment_price_multiple == WALLETS_PROD.client_segment_price_multiple));
    //  LA ELIMINACIÓN DEL OBJECTO
    if(INDEX_WAREHOUSE != -1){
      this.WALLETS_PRODUCT.splice(INDEX_WAREHOUSE,1);
    }
  }

  isLoadingProcess(){
    this.productService.isLoadingSubject.next(true);
    setTimeout(() => {
      this.productService.isLoadingSubject.next(false);
    }, 50);
  }

  processFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagen_previzualiza = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  isGift(){
    this.is_discount = this.is_discount == 1 ? 2 : 1;
    console.log(this.is_discount);
  }

  selectedDiscount(val:number){
    this.is_discount = val;
  }

  selectedTab(tab: number) {
    this.tab_selected = tab;
  }

  store() {
    // Validar campos requeridos
    if (!this.title || this.title.trim() === '') {
      this.toast.error("VALIDACIÓN", "El nombre del producto es requerido");
      return;
    }

    if (!this.description || this.description.trim() === '') {
      this.toast.error("VALIDACIÓN", "La descripción del producto es requerida");
      return;
    }

    if (!this.sku || this.sku.trim() === '') {
      this.toast.error("VALIDACIÓN", "El SKU del producto es requerido");
      return;
    }

    if (!this.price_general || this.price_general <= 0) {
      this.toast.error("VALIDACIÓN", "El precio del producto es requerido y debe ser mayor a 0");
      return;
    }

    if (!this.product_categorie_id) {
      this.toast.error("VALIDACIÓN", "La categoría del producto es requerida");
      return;
    }

    if (!this.tax_selected) {
      this.toast.error("VALIDACIÓN", "El impuesto del producto es requerido");
      return;
    }

    if (!this.weight || this.weight <= 0) {
      this.toast.error("VALIDACIÓN", "El peso del producto es requerido y debe ser mayor a 0");
      return;
    }

    if (!this.width || this.width <= 0) {
      this.toast.error("VALIDACIÓN", "El ancho del producto es requerido y debe ser mayor a 0");
      return;
    }

    if (!this.height || this.height <= 0) {
      this.toast.error("VALIDACIÓN", "El alto del producto es requerido y debe ser mayor a 0");
      return;
    }

    if (!this.length || this.length <= 0) {
      this.toast.error("VALIDACIÓN", "El largo del producto es requerido y debe ser mayor a 0");
      return;
    }

    if (!this.imagen_product) {
      this.toast.error("VALIDACIÓN", "La imagen del producto es requerida");
      return;
    }

    if (this.WAREHOUSES_PRODUCT.length === 0) {
      this.toast.error("VALIDACIÓN", "Necesitas ingresar al menos un registro de existencia de producto");
      return;
    }

    // Preparar los datos en el formato correcto
    let formData = new FormData();
    
    // Campos básicos
    formData.append("title", this.title.trim());
    formData.append("description", this.description.trim());
    formData.append("sku", this.sku.trim());
    formData.append("price_general", this.price_general.toString());
    formData.append("product_categorie_id", this.product_categorie_id);
    formData.append("tax_selected", this.tax_selected);
    formData.append("weight", this.weight.toString());
    formData.append("width", this.width.toString());
    formData.append("height", this.height.toString());
    formData.append("length", this.length.toString());
    formData.append("state", this.state);
    formData.append("disponiblidad", this.disponiblidad);
    
    // Campos JSON
    const warehousesProduct = this.WAREHOUSES_PRODUCT.map((warehouse: WarehouseProduct) => ({
      unit: {
        id: Number(warehouse.unit.id)
      },
      warehouse: {
        id: Number(warehouse.warehouse.id)
      },
      quantity: Number(warehouse.quantity)
    }));

    const warehousesProductJson = JSON.stringify(warehousesProduct);
    formData.append("WAREHOUSES_PRODUCT", warehousesProductJson);

    const walletsProduct = this.WALLETS_PRODUCT.map((wallet: any) => ({
      unit: {
        id: Number(wallet.unit.id)
      },
      sucursale: wallet.sucursale ? {
        id: Number(wallet.sucursale.id)
      } : null,
      client_segment: wallet.client_segment ? {
        id: Number(wallet.client_segment.id)
      } : null,
      price_general: Number(wallet.price_general)
    }));

    const walletsProductJson = JSON.stringify(walletsProduct);
    formData.append("WALLETS_PRODUCT", walletsProductJson);

    // Imagen
    formData.append("product_imagen", this.imagen_product);

    // Log de los datos antes de enviar
    console.log('Datos del producto a enviar:');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // Enviar al backend
    this.productService.registerProduct(formData).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);
        if (response.message === 200) {
          this.toast.success("ÉXITO", "Producto registrado correctamente");
          this.router.navigateByUrl('/products');
        } else {
          this.toast.error("ERROR", response.message_text || "Error al registrar el producto");
        }
      },
      (error) => {
        console.error('Error al registrar producto:', error);
        if (error.error && error.error.message_text) {
          this.toast.error("ERROR", error.error.message_text);
        } else {
          this.toast.error("ERROR", "Error al registrar el producto");
        }
      }
    );
  }

  cleanForm() {
    this.title = '';
    this.description = '';
    this.sku = '';
    this.price_general = 0;
    this.weight = 0;
    this.width = 0;
    this.height = 0;
    this.length = 0;
    this.state = '1';
    this.product_categorie_id = '';
    this.tax_selected = '1';
    this.importe_iva = 0;
    this.disponiblidad = '1';
    this.tiempo_de_abastecimiento = 0;
    this.umbral = '';
    this.umbral_unit_id = '';
    this.min_discount = 0;
    this.max_discount = 0;
    this.is_discount = 1;
    
    this.WAREHOUSES_PRODUCT = [];
    this.WALLETS_PRODUCT = [];
    this.imagen_previzualiza = 'assets/media/avatars/blank.png';
    
    // Recargar imagen predeterminada
    fetch('assets/media/avatars/blank.png')
      .then(response => response.blob())
      .then(blob => {
        this.imagen_product = new File([blob], 'default-image.png', { type: 'image/png' });
      });
  }
}
