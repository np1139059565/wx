//app.js
App({
  onLaunch: function () {
    this.units={
      //log
      logs : require("common/logs.js"),
      cfirms: require("common/confirms.js"),
      // fs by log
      fs:require("common/fs1.js"),
      //yun by log,setts
      yun:require("common/cyun.js"),
      // database by log,yun
      db:require("common/database.js"),
      // setts by log,database
      setts:require("common/setts.js"),
    }
    // init utils
    for(const k in this.units){
      if(typeof this.units[k].init=="function"){
        this.units[k].init(this)
      }
    }
    //refush setts
    this.units.setts.frefushSetts()
  }
})
