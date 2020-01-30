/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var Stock = require('../schema_stock');
var User = require('../schema_user');
let ip_address = "2.112.13.202,::ffff:10.16.10.70,::ffff:10.15.86.54"

chai.use(chaiHttp);

suite('Functional Tests', () => {
    
    after( async () => {
      await User.deleteMany({}, (err, record) => (err) ? false : record)
      await Stock.deleteMany({}, (err, record) => (err) ? false : record)
    });
    
    suite('GET /api/stock-prices => stockData object', () => {
      
      test('1 stock', done => {
       chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', ip_address)
        .query({stock: 'goog'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData")
          assert.isObject(res.body.stockData);
          assert.hasAllKeys(res.body.stockData, ['stock','price','likes'])
          assert.equal(res.body.stockData.likes, "0")
          done();
        });
      });
      
      test('1 stock with like', done => {
        chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', ip_address)
        .query({stock: 'goog', like: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData")
          assert.isObject(res.body.stockData);
          assert.hasAllKeys(res.body.stockData, ['stock','price','likes'])
          assert.equal(res.body.stockData.likes, "1")
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', done => {
        chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', ip_address)
        .query({stock: 'goog', like: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData")
          assert.isObject(res.body.stockData);
          assert.hasAllKeys(res.body.stockData, ['stock','price','likes'])
          assert.equal(res.body.stockData.likes, "1")
          done();
        });
      });
      
      test('2 stocks', done => {
        chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', ip_address)
        .query({stock: ['goog', 'mstf']})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData")
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2)
          assert.hasAllKeys(res.body.stockData[0], ['stock','price','rel_likes'])
          assert.hasAllKeys(res.body.stockData[1], ['stock','price','rel_likes'])
          assert.equal(res.body.stockData[0].rel_likes, "0")
          done();
        });
      });
      
      test('2 stocks with like', done => {
        chai.request(server)
        .get('/api/stock-prices')
        .set('x-forwarded-for', ip_address)
        .query({stock: ['goog', 'mstf'], like:true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData")
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2)
          assert.hasAllKeys(res.body.stockData[0], ['stock','price','rel_likes'])
          assert.hasAllKeys(res.body.stockData[1], ['stock','price','rel_likes'])
          assert.equal(res.body.stockData[0].rel_likes, "0")
          done();
        });
      });
      
    });

});
