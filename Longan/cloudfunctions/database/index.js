// 部署：在 cloud-functions/database 文件夹右击选择 “上传并部署-云端安装依赖”
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV//yfwq1-4nvjm
})
// const collection = cloud.database().collection('kiwi')//默认数据库为kiwi


function add(colle, conter) {
  if (conter == undefined) {
    conter = ""
  }
  var ct = conter
  if ((conter instanceof Object) == false) {
    ct = {
      conter: conter
    }
  }
  if (ct._id == undefined) {
    ct._id = (""+Date.now())
  }
  return colle.add({data: ct})
}

function kiwiRemove(coll,event) {
  const _=cloud.database().command
  const removeGeo=event.removeGeo
  //object remove by 1
  if(removeGeo.counts){
    removeGeo.counts=loopRemoveBy1(removeGeo.counts)
  }
  if(removeGeo.infos){
    removeGeo.infos=loopRemoveBy1(removeGeo.infos)
  }
  //arr remove
  if(removeGeo.keys){
    removeGeo.keys=_.pullAll(removeGeo.keys)
  }

  //refush time
  removeGeo.time=new Date().getTime()

  return coll.doc(event.id).update({data:removeGeo})
}
function loopRemoveBy1(obj){
  const _=cloud.database().command
  for(var k in obj){
    obj[k]=(obj[k]==1?_.remove():loopRemoveBy1(obj[k]))
  }
  return obj
}


/**
 *
 * @param dbName1
 * @param geo1
 * @returns {*}
 */
function geoToCollection(event){
  const geo1=event.geo
  const dbName1=event.dbName
  var commands=""
  for (var g in geo1) {
    //前端只支持doc.update,服务端还支持where.update//cloud.database().collection('kiwi').doc(id)
    switch (g) {
      case "where":
        commands+="['where']("+JSON.stringify(geo1[g])+")"//
        break;
      case "limit":
        commands+="['limit']("+(geo1[g] >= 0 ? geo1[g] : 1)+")"//default 1 {limit:1}
        break;
      case "orderBy":
        commands+="['orderBy']("+geo1[g].cel+","+geo1[g].order+")"//{orderBy:{cel:1,order:2}}
        break;
      case "skip":
        commands+="['skip']("+(geo1[g] >= 0 ? geo1[g] : 0)+")"//default 0
        break;
      case "field"://如果没有过滤条件,则默认查询所有数据
        commands+="['field']("+JSON.stringify(geo1[g])+")"//{field:{settings:true,times:false}}
        break;
      case "doc":
        commands+="['doc']("+geo1[g]+")"//document
        break;
      default:
        return ("is not find geo:" + g)
    }
  }
  return eval("cloud.database().collection('"+dbName1+"')"+commands)
}
function collToPromise(coll1,event){
  var qtype=event.queryType
  if (typeof qtype != "string") {
    qtype = ""
  }

  switch (qtype) {
    // case "add":
    //   return add(coll1, event.conter)
    //   break;
    // case "del":
    //   return coll1.remove()
    //   break;
    case "kiwiRemove":
      return kiwiRemove(coll1,event)
      break;
    case "update":
      return coll1.update({data: event.updateGeo})//只能更新object,arr是直接覆盖的
      break;
    case "query":
      return coll1.get()//这里不能放到{}里,必须直接get
      break;
    default:
      return {code: 0, errMsg: ("collToPromise:is not find queryType:" + qtype)}
  }
}

/**
 * 云函数入口函数
 * @param event {dbName:"kiwi",queryType: "query", geo: geo}
 * @param context
 * @returns {Promise<*>}
 */
exports.main = async(event, context) => {//查数据库只能使用异步接口
  try {
    const geoCollecton=geoToCollection(event)
    if(typeof geoCollecton=="string"){
      return {code:0,errMsg:geoCollecton}
    } else return collToPromise(geoCollecton,event)
  } catch (e) {
    return {code: 0, errMsg: e.stack}
  }
}