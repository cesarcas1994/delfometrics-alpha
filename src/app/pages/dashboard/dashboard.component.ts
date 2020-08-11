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
  public json_parse_error: string = "";
  
  // apis variables
  public status: string;
  public show_response: boolean = false;
  public predictor_result_per_day_sells: any;
  public predictor_result_per_day_weight: any;
  public sells_month_array: any;

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
      }
    );
  }

  // model object
  textarea_input_value = {"items":[{"title":"Alimento Royal Canin perro adulto 12.5kg","site_id":"MLM","price":350,"reputation_vendor":3,"vendor_sales_completed":232,"logistic_type":"drop_off","free_shipping":"true","ranking":286,"conversion":0.019,"condition":"new","catalog_product":"false","video":"false","accepts_mercadopago":"true","tags":"good_quality_thumbnail brand_verified good_quality_picture immediate_payment cart_eligible","num_pictures":2,"attributes":"BRAND_Hill´s BREED_SIZE_Raza_pequeña FLAVOR_Pollo GTIN_2321223 ITEM_CONDITION_Nuevo","reviews_average":0,"reviews_total":0,"official_store":"false","deal_ids":"false","warranty":"true","listing_type_id":"gold_pro"}],"category_id":"MLM1077"}; 

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
  
}


