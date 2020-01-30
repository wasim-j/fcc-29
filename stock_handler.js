const request = require("request-promise-native");
const User = require("./schema_user");
const Stock = require("./schema_stock");

module.exports = class {
  constructor(){
  
  }
  format_stock(stock_name, like=false){
    if(Array.isArray(stock_name)) {
      this.stock = stock_name.map( stock => {
        return {name: stock, like}
      })
    }
    else {
      this.stock = [{name: stock_name, like}]
    }
    return this.stock;
  }
  async get_price(arr_of_objs){
    
    let prices = await Promise.all(arr_of_objs.map(obj =>{
      let options = {
        uri: `https://repeated-alpaca.glitch.me/v1/stock/${obj.name}/quote`,
        json: true
      }
      return request(options)
        .then(function (data) {
            return data.latestPrice;
        })
        .catch(function (err) {
            console.log(err); // API call failed...
            if(err) return false;
        });      
      
    }));    
    
    arr_of_objs.forEach( (obj,i) => {
      obj.price = (prices[i]) ? prices[i] : null;
    })
    return arr_of_objs;
    
  }
  is_stock_valid(arr_of_objs){
    return arr_of_objs.map(obj => {
      obj.valid = (obj.price) ? true : false;
      return obj;
    })
  }
  clear_invalid_stock(arr_of_objs){
    return arr_of_objs.filter(obj => obj.valid);
  }
  async get_stock(arr_of_objs){
    let stock = await Promise.all(arr_of_objs.map( obj => {
      return Stock.findOne({name: obj.name}, (err, record) => (err) ? false : record);
    })) 
    arr_of_objs.forEach( (obj,i) => {
      obj.db = (stock[i]) ? stock[i] : null;
    })
    return arr_of_objs;
  }
  is_already_liked(arr_of_objs, user_like_list){
    arr_of_objs.forEach(obj => {
      obj.already_liked = (user_like_list.find(liked => liked = obj.name)) ? true : false;
    })
    return arr_of_objs;
  }
  async add_stock_like(arr_of_objs){
    let stock = await this.get_stock(arr_of_objs);
    stock = await Promise.all(arr_of_objs.map((obj, i) => {
      if(obj.already_liked && obj.db) return Promise.resolve(obj.db)
      if(obj.db) return this.update_stock(obj.db)     
      return this.create_stock(obj.name)
    }))
    arr_of_objs.forEach((obj,i) => {
      obj.db = stock[i]
    })
    return arr_of_objs;
  }
  create_stock(name){
    let new_stock = new Stock({name})
    let error = new_stock.validateSync();
    if(error) return false;
    return new_stock.save();
  }
  update_stock(stock){
    stock.likes += 1;
    return stock.save();
  }
  set_likes(arr_of_objs){
    arr_of_objs = this.get_likes(arr_of_objs);
    if(arr_of_objs.length > 1) arr_of_objs = this.get_rel_likes(arr_of_objs)
    return arr_of_objs;
  }
  get_likes(arr_of_objs){
    arr_of_objs.forEach( obj => {
      obj.likes = (obj.db) ? obj.db.likes : 0;
    })
    return arr_of_objs
  }
  get_rel_likes(arr_of_objs){
    arr_of_objs.forEach((obj,i,arr) =>{
      let this_obj_likes = obj.likes;
      let other_obj_likes = (i === 0) ? arr[1].likes : arr[0].likes;
      let greater = this_obj_likes === other_obj_likes;
      let lesser = this_obj_likes < other_obj_likes;
      //let equal = this_obj_likes === other_obj_likes

      obj.rel_likes = (greater || lesser) ? this_obj_likes - other_obj_likes : 0
    })
    return arr_of_objs;
  }
  format_for_client(arr_of_objs){
    let format = arr_of_objs.map( (obj,i, arr) => {
      let formatted = {
        stock: obj.name,
        price: obj.price,
      }
      if (arr.length > 1) {
        formatted.rel_likes = obj.rel_likes
      }
      else {
        formatted.likes = obj.likes
      }
      return formatted;
    })
    
    if(arr_of_objs.length > 1) return {stockData: format}
    return {stockData: format[0]}
  }
  
}