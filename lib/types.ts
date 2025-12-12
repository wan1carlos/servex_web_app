// Type definitions for ServEx API

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  wallet: number;
  img?: string;
  onesignal_id?: string;
}

export interface Store {
  id: string;
  name: string;
  img: string;
  rating: number;
  delivery_charges: number;
  delivery_time: string;
  open: boolean;
  delivery_by: number;
  cod: number;
  stripe_key?: string;
  razor_key?: string;
  gcash_qr_image?: string;
  gcash_enabled?: number;
  lat: string;
  lng: string;
  distance?: string;
}

export interface Category {
  id: string;
  name: string;
  img: string;
}

export interface Item {
  id: string;
  name: string;
  img: string;
  price: number;
  description: string;
  category_id: string;
  store_id: string;
  addon?: Addon[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  qtype: string;
  id: string;
  cart_no: string;
  item_id: string;
  item: string;
  img: string;
  qty: number;
  qtyName: string;
  price: number;
  item_size: string;
  item_size_id: string;
  addon: Addon[];
}

export interface CartData {
  data: CartItem[];
  total: number;
  item_total: number;
  sub_total?: number;
  d_charges: number;
  discount: number;
  tax_name?: string;
  tax_value: number;
  open: boolean;
  currency: string;
  store: Store;
  date?: string;
  hasOffer?: any;
  pay_info?: string;
}

export interface Order {
  id: string;
  store_name: string;
  order_date: string;
  order_time: string;
  total: number;
  status: number;
  o_type: number;
  items: any[];
  address: string;
  dboy?: string;
  dboy_phone?: string;
  dboy_image?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  license_number?: string;
}

export interface Address {
  id: string;
  user_id: string;
  address: string;
  lat: string;
  lng: string;
  landmark: string;
  phone: string;
  name: string;
}

export interface AppText {
  [key: string]: string;
}

export interface AppSettings {
  stripe_key: string;
  razor_key: string;
  paypal_key: string;
  currency: string;
  cod: number;
  onesignal_id: string;
}

export interface Language {
  id: string;
  name: string;
  type: '0' | '1'; // 0 = LTR, 1 = RTL
}

export interface City {
  id: string;
  name: string;
}
