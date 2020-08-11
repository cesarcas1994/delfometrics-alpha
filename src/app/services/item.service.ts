import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';

 @Injectable()
 export class ItemService{
   
    constructor(
        private _http: HttpClient
    ){

    }
    
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

   /*
   * Logic
   */

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


