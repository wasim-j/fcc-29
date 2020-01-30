'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const Stock_Handler = require('../stock_handler')
const User_Handler = require('../user_handler')

module.exports = app => {

  app.route('/api/stock-prices')
    .get( async (req, res) =>{
      
      // check if stock query valid
      let stock = req.query.stock;
      if(!stock) res.send('no stock requsted');
    
      let stock_handler = new Stock_Handler();
      let stock_arr_of_objs = stock_handler.format_stock(stock, req.query.like);
      stock_arr_of_objs = await stock_handler.get_price(stock_arr_of_objs);
      stock_arr_of_objs = stock_handler.is_stock_valid(stock_arr_of_objs);
      stock_arr_of_objs = stock_handler.clear_invalid_stock(stock_arr_of_objs);
      if(stock_arr_of_objs.length === 0) return res.send('no valid stock requested');
    
      if(!req.query.like){
        stock_arr_of_objs = await stock_handler.get_stock(stock_arr_of_objs);
      }
      else{
        let ip = req.get('x-forwarded-for').split(',')[0];
        let user_handler = new User_Handler();
        let user = await user_handler.get_user(ip);
        if(!user) user = await user_handler.create_user(ip);
        stock_arr_of_objs = stock_handler.is_already_liked(stock_arr_of_objs, user.likes)
        stock_arr_of_objs = await stock_handler.add_stock_like(stock_arr_of_objs);
        stock_arr_of_objs.forEach(obj => {
          if(!obj.already_liked) user.likes.push(obj.name);
        })
        await user_handler.save_user(user);
      }
      stock_arr_of_objs = stock_handler.set_likes(stock_arr_of_objs);
    
      let formatted = stock_handler.format_for_client(stock_arr_of_objs)
      res.json(formatted);
    });  
};
