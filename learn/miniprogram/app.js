//app.js
App({
  onLaunch: function () {
    //all data
    this.callbacks=[]
    this.subjectid=null
    this.dbpath=null
    this.DB_K={
      COUNTS:"counts",
      HEADS:"heads",
      INFOS:"infos",
      KEYS:"keys",
      SETTINGS:"settings",
      SKEY:"en",
      COUNT:"c",
      DAY:"d"
    }
    this.imagepath=null
    this.voicepath=null

    //def events
    /**
     *
     * @param title
     * @param okcallback
     * @param cancelcallback
     */
    this.showModal=(title,okcallback,cancelcallback)=>{
      //ok,cancel
      wx.showModal({
        title:title,
        showCancel:cancelcallback!=null,
        confirmText:"ok",
        cancelText:"cancel",
        success:(res)=>{
          try{
            if(res.confirm){
              if(typeof okcallback=="function"){
                okcallback()
              }
            }else if(res.cancel){
              if(typeof cancelcallback=="function"){
                cancelcallback()
              }
            }
          }catch (e) {
            this.mlog.err(e)
          }
        }
      })
    }
    /**
     *
     * @param itemList
     * @param okcallback (selectVal,selectIndex)
     */
    this.showActionSheet=(itemList,okcallback,cancelcallback)=>{
      // select
      wx.showActionSheet({
        itemList: itemList,//['A', 'B', 'C'],
        complete: (res)=> {
          try{
            if(res.errMsg.endsWith(":ok")){
              if(typeof okcallback=="function"){
                okcallback(itemList[res.tapIndex],res.tapIndex)
              }
            }else if(typeof cancelcallback=="function"){
              cancelcallback()
            }
          }catch (e) {
            this.mlog.err(e)
          }
        }
      })
    }

    /**
     *
     * @param event
     * @param isSave
     */
    this.runcallbacks=(event,isSave)=>{
      if(event!=null){
        this.mlog.info("run callback:"+event)
        if(isSave){
          this.mlog.info("add callback"+event)
          this.callbacks.push(event)
        }else event(this)
      }

      this.callbacks.map(e=>{
        try{
          e(this)
        }catch (e1){
          this.mlog.err(e1,"run callback is fail:"+e)
        }
      })

    }
    /**
     *
     * @param arr
     * @param callback
     */
    this.switchDB=(arr,callback)=>{
      this.showActionSheet(arr,(sval,sindex)=>{
        callback(arr[sindex],sindex)
      },()=>{
        this.mlog.err("not select subject.")
        callback(null)
      })
    }
    this.checkpaths=()=>{
      this.mlog.info("check files...")
      this.dbpath=this.file.udir+"/dbs/"+this.subjectid+"/"

      const dbarr=[]
      for(const k in this.DB_K)dbarr.push(this.DB_K[k])
      const fields={}
      var fnumber=0
      dbarr.map(k=>{
        const field=this.file.isExist(this.dbpath+k)==false
        if(field){
          fields[k]=field
          fnumber+=1
        }
        this.mlog.info(k+" find is:"+!field)
      })
      if(fnumber>0){
        this.db.querySync({field:fields},(code,arr)=>{
          if(code){
            dbarr.map(k=>{
              if(fields[k]){
                this.mlog.info("save "+k+"...")
                this.file.writefile(this.dbpath+k,JSON.stringify(arr[0][k]))
              }
            })
            //check dirs
            this.checkdirs()
          }
        })
      }else this.checkdirs()
    }
    this.checkdirs=()=>{
      this.mlog.info("check dirs...")
      const infos=JSON.parse(this.file.readfile(this.dbpath+this.DB_K.INFOS))
      const loopck=(dirpath,fkarr)=>{
        if(this.file.isExist(dirpath)&&this.file.getinfo(dirpath).isDirectory()){
          this.mlog.info("dir find is true:"+dirpath)
        }else{
          this.mlog.info("dir is not find:"+dirpath)
          for(const kcode in infos){
            fkarr.map(fkey=>{
              const ypath=infos[kcode][fkey]
              const dstpath=dirpath+"/"+kcode+"."+ypath.substr(ypath.lastIndexOf("/")).split(".")[1]
              this.file.downYunFile("cloud://yfwq1-4nvjm.7966-yfwq1-4nvjm-1302064482/"+ypath,
                  dstpath,(code)=>{
                if(!code){
                  this.mlog.err("download is false.")
                }
              })
            })
          }
        }
      }
      this.imagepath=this.dbpath+"images"
      loopck(this.imagepath,["image"])
      this.voicepath=this.dbpath+"voices"
      loopck(this.voicepath,["zhvoice","envoice"])
    }
    this.refushdata=()=>{
      this.checkpaths()
      this.mlog.info("read setts...")
      this.setts=JSON.parse(this.file.readfile(this.dbpath+this.DB_K.SETTINGS))
      this.fzk=require("pages/index/fzk.js")
      //by file,db
      this.fzk.init(this.mlog,this)
    }

    //events
    this.mlog=require("common/mlog.js")
    this.mlog.init()
    this.yun=require("common/yun.js")
    this.yun.init(this.mlog)
    this.file=require("common/file.js")
    this.file.init(this.mlog)

    const dbpath=this.file.udir+"/dbs/"
    this.mlog.info("check local dbs:"+dbpath)
    if(this.file.isExist(dbpath)&&this.file.getinfo(dbpath).isDirectory()){
      const dbs=this.file.readdir(dbpath)
      if(dbs.length>1){
        this.mlog.info("dbs:",dbs)
        this.switchDB(dbs,(sval)=>{
          this.subjectid=sval
        })
      }else this.subjectid=dbs[0]
    }

    this.db=require("common/db.js")
    //by yun
    this.db.init(this.mlog,this,this.refushdata)
  }
})
