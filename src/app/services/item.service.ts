import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';
import {Categories_to_train} from '../models/categories_to_train';
import {Categories_to_time} from '../models/categories_to_time';

 @Injectable()
 export class ItemService{
   
    constructor(
        private _http: HttpClient
    ){

    }
    
    //TODO cambiar los post por get a las llamadas que son get(ahora todos son post)
    post_item_per_day_sells(textarea_input):Observable<any>{
        
        let body = JSON.stringify(textarea_input.textarea);
        let post_headers = new HttpHeaders().set('Content-Type', 'application/json');
        let url = "https://prod-20.centralus.logic.azure.com:443/workflows/bcec4a46a2d64d109c1d8a83d0b7791b/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=leNB3U_CW5gc2be7GRIfH27VgZnPqQ_MCUKBbyca1Mg";
        
        return this._http.post(url, body, {headers: post_headers});
    }

    post_item_per_day_weight(textarea_input):Observable<any>{

        // Pendiente pasarlo como params
        let url = "https://productionalpha.azurewebsites.net/api/day_visits_weight?code=ZH7nZn8a4MoC5CrafyAdLZkniR35nkmq2hNo2wsY8456dxdxFygJbQ==&category_id=";
        let category_id = textarea_input.textarea.category_id;

        url = url + category_id;
        return this._http.get(url);

        //return this._http.get(url, {params: textarea_category_id_input});
    }

    post_one_item_features(item_id):Observable<any>{

        // Pendiente pasarlo como params
        let url = "https://one-item-features.azurewebsites.net/www/test?item_id=";

        url = url + item_id;
        return this._http.get(url);

        //return this._http.get(url, {params: textarea_category_id_input});
    }

    post_one_item_catalog(catalog_product):Observable<any>{

        let url = "https://productionalpha.azurewebsites.net/api/one_item_catalog?code=RXzrvm59PH31jrMaa5KRe0lA/rro4CrMQ385FEQec2Qr1kM1V9mGEQ==&catalog_product=";

        url = url + catalog_product;
        return this._http.get(url);
    }

    post_dinamic_ml_categories_training(category_id):Observable<any>{

        let body_object: Categories_to_train = { input_category_id: category_id };

        let body = JSON.stringify(body_object);
        let post_headers = new HttpHeaders().set('Content-Type', 'application/json');
        /*let post_headers =  new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': ''
          });
          */
        let url = "https://prod-09.centralus.logic.azure.com:443/workflows/bb8b6cd07e8b4f2ebf6e436d8baee782/triggers/request/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Frequest%2Frun&sv=1.0&sig=6KiSJiRLYathVAJYJHv_zdv_Ckin2QXaSKL4Qp2lXTk";
        
        return this._http.post(url, body, {headers: post_headers});
    }

    post_time_category_training(category_id_to_time):Observable<any>{

        let body_object: Categories_to_time = {category_id: category_id_to_time};

        let body = JSON.stringify(body_object);
        let post_headers = new HttpHeaders().set('Content-Type', 'application/json');
        let url = "https://mlconexionmeli.azurewebsites.net/api/time_category_training";
        
        return this._http.post(url, body, {headers: post_headers});
    }

   /*
   * Logic
   */

    organizer_json_one_item_features(json_api):Object{

        var myobject = new Object();

        myobject["title"] = json_api["Response"]["title"];
        myobject["site_id"] = json_api["Response"]["site_id"]
        myobject["price"] = json_api["Response"]["price"]
        myobject["reputation_vendor"] = json_api["Response"]["reputation_vendor"]
        myobject["vendor_sales_completed"] = json_api["Response"]["vendor_sales_completed"]
        myobject["logistic_type"] = json_api["Response"]["logistic_type"]
        myobject["free_shipping"] = json_api["Response"]["free_shipping"]
        myobject["ranking"] = json_api["Response"]["ranking"]
        myobject["conversion"] = json_api["Response"]["conversion"]
        myobject["condition"] = json_api["Response"]["condition"]
        myobject["catalog_product"] = json_api["Response"]["catalog_product"]
        myobject["video"] = json_api["Response"]["video"]
        myobject["accepts_mercadopago"] = json_api["Response"]["accepts_mercadopago"]
        myobject["tags"] = json_api["Response"]["tags"]
        myobject["num_pictures"] = json_api["Response"]["num_pictures"]
        myobject["attributes"] = json_api["Response"]["attributes"]
        myobject["reviews_average"] = json_api["Response"]["reviews_average"]
        myobject["reviews_total"] = json_api["Response"]["reviews_total"]
        myobject["official_store"] = json_api["Response"]["official_store"]
        myobject["deal_ids"] = json_api["Response"]["deal_ids"]
        myobject["warranty"] = json_api["Response"]["warranty"]
        myobject["listing_type_id"] = json_api["Response"]["listing_type_id"]

        let json_organizer = {
            items: [myobject],
            category_id: json_api["Response"]["category_id"]
        }
        
        return json_organizer
    }

    change_day_to_month_weight(per_day_weight, per_day_sells):Object{

        var per_month_weight = {
            children_category: per_day_weight.children_category,
            father_category_id: per_day_weight.father_category_id,
            month_weight: {}
        }

        //transfrom weight day to.. 
        var i = 1;
        var newValue = 0;
        var position_decimal = 1;
        Object.keys(per_day_weight.day_weight).forEach(key => {
            if(key.indexOf(i + "") !== position_decimal){
                var newMonth = i + "";
                per_month_weight.month_weight[newMonth] = newValue;
                i = i + 1;
                newValue = 0;
                if(i == 10){position_decimal = 0;}

            }else if(key == "12-31"){
                var newMonth = i + "";
                newValue = newValue + per_day_weight.day_weight[key];
                per_month_weight.month_weight[newMonth] = newValue;

            }        
            newValue = newValue + per_day_weight.day_weight[key];

            });

            const sells_month_array = [];
            Object.keys(per_month_weight.month_weight).forEach(key => {
                
            sells_month_array.push(per_month_weight.month_weight[key] * per_day_sells * 365);

        })

        return sells_month_array;
    }

 }


