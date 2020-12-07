import { Component, OnInit } from "@angular/core";
import Chart from 'chart.js';
import { ItemService } from '../../services/item.service'; 
import { Comment } from '../../models/item'; 

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html",
  providers: [ItemService]
})
export class DashboardComponent implements OnInit {
  public canvas : any;
  public ctx;
  public datasets: any;
  public data: any;
  public myChartData;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  public clicked2: boolean = false;
  
  // apis variables
  public status: string;
  public show_response: boolean = false;
  public json_item_one_features: any;
  public predictor_result_per_day_sells: any;
  public predictor_result_per_day_weight: any;
  public sells_month_array: any;
  public textarea_input_value: any;
  public item_id_url_input:string;
  public catalog_product_url_input:string;

  constructor(
    private _itemService: ItemService
  ) {

  }

  ngOnInit() {

    var gradientChartOptionsConfigurationWithTooltipRed: any = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }],
       
        
        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    var chart_labels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    this.datasets = [
      [100, 70, 90, 70, 85, 60, 75, 60, 90, 80, 110, 10],
      [80, 120, 105, 110, 95, 105, 90, 100, 80, 95, 70, 120],
      [60, 80, 65, 130, 80, 105, 90, 130, 70, 115, 60, 130]
    ];
    this.data = this.datasets[0];

    this.canvas = document.getElementById("chartBig1");
    this.ctx = this.canvas.getContext("2d");

    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors

    var config = {
      type: 'line',
      data: {
        labels: chart_labels,
        datasets: [{
          label: "ventas del mes",
          fill: false,
          backgroundColor: gradientStroke,
          borderColor: '#ec250d',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#ec250d',
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: '#ec250d',
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: this.data,
        }]
      },
      options: gradientChartOptionsConfigurationWithTooltipRed
    };
    this.myChartData = new Chart(this.ctx, config);
  
  }
  public updateOptions(updateOptionsupdateOptions) {
    this.myChartData.data.datasets[0].data = this.data;
    this.myChartData.update();
  }
  
  public sendItem() {
    let textarea_input: Comment = { textarea: this.textarea_input_value };
    
    this._itemService.post_item_per_day_sells(textarea_input).subscribe(
      response =>{
        // hide screens
        this.category_training_Screen_Section("none");
        
        this.predictor_result_per_day_sells = response;

        /*
        *if api call success then call weight calculation
        */ 
        if(response.prediccion != null){
          
          this._itemService.post_item_per_day_weight(textarea_input).subscribe(
            response =>{
                 
              var sells_day_predictor = this.predictor_result_per_day_sells.prediccion;
              this.chart_Screen_Section();
              
              this.sells_month_array = this._itemService.change_day_to_month_weight(response, sells_day_predictor);
              this.myChartData.data.datasets[0].data = this.sells_month_array;
              this.myChartData.update();
              //remember -go to production- to give access to CORS in azure function when deploid
              this.predictor_result_per_day_weight = response;
              
            },
            error => {
              console.log(error);
              this.status = 'error';
            }
          )
        }
      },
      error => {
        this.predictor_result_per_day_sells = error.error;
        this.status = 'error';

        if(error.error.error == "No se encuentra esa categoria en base de datos, posteriormente la adicionaremos en la base de datos"){
          this.category_training_Screen_Section("block");

          let category_id = textarea_input.textarea.category_id;
          //show time
          this._itemService.post_time_category_training(category_id).subscribe(
            response =>{
              //TODO change to time format: horas: min, ex: 1h 45min. 
              let time_to_train = response * 4;

              var message = document.getElementById(" time_category_training_row");
              message.innerHTML = "El tiempo de desarrollo de esta categoría" + category_id + " es: " + time_to_train + " segundos";
            },
            error => {
              console.log(error);
              this.status = 'error';
            }
          )   
        }
        else{
          this.category_training_Screen_Section("none");
          //TODO all logic came here 400 and other 404 different than if, add if else in case of expansion on logic
    
        }
      }
    );
  }

  //TODO Complete trainCategory  
  public trainCategory() {
    let textarea_input: Comment = { textarea: this.textarea_input_value };
    let category_id = textarea_input.textarea.category_id;

    category_id = category_id.toLowerCase();
    
    this._itemService.post_dinamic_ml_categories_training(category_id).subscribe(
      response =>{
        console.log("already sent to train the category: ", category_id);
        var message = document.getElementById(" message_category_training_row");
        message.innerHTML = "Ya se está entrenando la categoría: " + category_id + " pronto podrás repetir el proceso y obtendrás la predicción de ventas";
      },
      error => {
        //TODO reportar los problemas a una base de datos en azure
        var message = document.getElementById(" message_category_training_row");
        message.innerHTML = "No se pudo poner a entrenar la categoría: " + category_id + " Comunicate con contactos para informar el problema";
        console.log(error.error);
      }
    )
  }

  // model object
  //textarea_input_value = {"items":[{"title":"Alimento Royal Canin perro adulto 12.5kg","site_id":"MLM","price":350,"reputation_vendor":3,"vendor_sales_completed":232,"logistic_type":"drop_off","free_shipping":"true","ranking":286,"conversion":0.019,"condition":"new","catalog_product":"false","video":"false","accepts_mercadopago":"true","tags":"good_quality_thumbnail brand_verified good_quality_picture immediate_payment cart_eligible","num_pictures":2,"attributes":"BRAND_Hill´s BREED_SIZE_Raza_pequeña FLAVOR_Pollo GTIN_2321223 ITEM_CONDITION_Nuevo","reviews_average":0,"reviews_total":0,"official_store":"false","deal_ids":"false","warranty":"true","listing_type_id":"gold_pro"}],"category_id":"MLM1077"}; 

  set input_url(v) {

    if((this.checker_url_format(v) == "logic_error") || (this.checker_url_format(v) == "url_format_error")){
      this.input_Url_Error("block");
      console.log("error", this.checker_url_format(v));
    }

    else if(this.checker_url_format(v) == "found item_catalog"){

      this.input_Url_Error("none");
        this._itemService.post_one_item_catalog(this.catalog_product_url_input).subscribe(
          response =>{
            let item_id = response.response;

            //search item features in php api

            this._itemService.post_one_item_features(item_id).subscribe(
              response =>{
                this.json_item_one_features = response;
                this.textarea_input_value = this._itemService.organizer_json_one_item_features(this.json_item_one_features);
              
              },
              error => {
                console.log(error);
                this.status = 'error';
              }
            )
            //this.input_Url_Error("none");}        
          },
          error => {
            console.log("error calling azure function one_item_catalog, error: ", error)
          }
        );  
    }

    else if(this.checker_url_format(v) == "found item_id"){

      this.input_Url_Error("none");
        let item_id = this.item_id_url_input;

        //search item features in php api

        this._itemService.post_one_item_features(item_id).subscribe(
          response =>{
            this.json_item_one_features = response;
            this.textarea_input_value = this._itemService.organizer_json_one_item_features(this.json_item_one_features);
            
          },
          error => {
            console.log(error);
            this.status = 'error';
          }
        )
        //this.input_Url_Error("none");}
    }
    
  }

  // input_data
  get input_data () {
    return JSON.stringify(this.textarea_input_value, null, 2);
  }

  set input_data (v) {  
    try{  
      this.textarea_input_value = JSON.parse(v);
      this.json_Parse_Error("none");}
    catch(e) {
      this.json_Parse_Error("block");
      console.log('error occurred while you were typing the JSON');
    };

  }

  // show_data
  get show_data(){
      return JSON.stringify(this.predictor_result_per_day_sells, null, 2);
  }

  set show_data (v) {
      try{
        this.predictor_result_per_day_sells = JSON.parse(v);
      }
      catch(e){
        console.log('error occurred to obtein response');
      };

  }

  get show_caption(){
    return "error occurred while you were typing the JSON";
  }
  
  public input_Url_Error(v) {
    var x = document.getElementById(" caption_input_url");

    switch (v){
    case 'none':
      x.style.display = "none";
    break;
    case 'block':
      x.style.display = "block";
    break;
    }
  }

  public json_Parse_Error(v) {
    var x = document.getElementById(" caption_json_parse");

    switch (v){
    case 'none':
      x.style.display = "none";
    break;
    case 'block':
      x.style.display = "block";
    break;
    }
  }

  //Pendiente cambiar a dependender de llamada success
  public chart_Screen_Section() {
    var x = document.getElementById(" chart_row");
    if (x.style.display === "none") {
      x.style.display = "block";
    } 

  }

  public category_training_Screen_Section(v) {
    var x = document.getElementById(" category_training_row");

    switch (v){
      case 'none':
        x.style.display = "none";
      break;
      case 'block':
        x.style.display = "block";
      break;
    }
    /*
    if (x.style.display === "none") {
      x.style.display = "block";
    } 
    else if(x.style.display === "block") {
      x.style.display = "none";
    } 
    */
  }

  /*
  * logic
  */
   
  checker_url_format(url_input):string{

    try {
        // case item - not Catalogue
            
            var myarr = url_input.split("-");

            if((myarr[1].match(/^[0-9]+$/) != null) || (parseInt(myarr[1]) > 1000)){ 
              this.item_id_url_input = "MLM" + myarr[1];
              return "found item_id";
            }

            //Check that the value is a number format item_id form meli
            //if((myarr[1].match(/^[0-9]+$/) == null) || (parseInt(myarr[1]) < 1000)){ return "error";} 

        // case item - it is Catalogue

            var catalog_product = "";
            //case "?" after item_id
            
            var myarr = url_input.split("p/");
            var myarr2 = myarr[1].split("?");
            var search_pos_product = myarr2[0].split("MLM");
            var search_pos_product_number = search_pos_product[1];
            if ((search_pos_product_number.match(/^[0-9]+$/) != null) && (parseInt(search_pos_product_number) > 1000)){
                catalog_product = "MLM" + search_pos_product_number;

            }
            //case "/" after item_id

            var myarr = url_input.split("p/");
            var myarr2 = myarr[1].split("/");
            var link_pos_product = myarr2[0].split("MLM");
            var link_pos_product_number = link_pos_product[1];
            if ((link_pos_product_number.match(/^[0-9]+$/) != null) && (parseInt(link_pos_product_number) > 1000)){
                catalog_product = "MLM" + link_pos_product_number;

            }
      
            if(catalog_product != ""){
              //logic get item_id from product_catalogue
              this.catalog_product_url_input = catalog_product;
              return "found item_catalog";
            }

        return "url_format_error"; 
    } catch (error) {
      console.log("checker_url_format error : ",error)
        return "logic_error";
    }  
  }
}


