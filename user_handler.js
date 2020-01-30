const User = require("./schema_user");

module.exports = class {
  constructor(){
    
  }
  get_user(ip){
    return User.findOne({ip}, (err, record) => (err) ? false : record);
  }
  create_user(ip){
    let new_user = new User({
      ip: ip,
    })
    let error = new_user.validateSync();
    if(error) return false;
    return new_user;
  }
  save_user(new_user){
    let error = new_user.validateSync();
    if(error) return false;
    return new_user.save();
  }
}