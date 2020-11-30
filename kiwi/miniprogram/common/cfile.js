const LOCAL_MSIZE = 200

var app, FSM, LOCAL_FTP, YUN_FTP, localPaths

module.exports.init = (_app) => {
    app = _app
    FSM = wx.getFileSystemManager()
    LOCAL_FTP = wx.env.USER_DATA_PATH + "/FILES/"
    YUN_FTP = "cloud://yfwq1-4nvjm.7966-yfwq1-4nvjm-1302064482/"

    module.exports.fgetFtpath = getFtpath
    module.exports.fwriteToLocal = writeToLocal
    module.exports.freadLocalFile = readLocalFile
    module.exports.fsaveTmpFileToLY = saveTmpFileToLY
    module.exports.fremoveLYFile = removeLYFile
    module.exports.floopReLocalSpace = loopReLocalSpace
    module.exports.fcleanLocalFile = cleanLocalFile
    module.exports.fdownUrlToTmp = downUrlToTmp
    module.exports.fdownAllYunToLocal = downAllYunToLocal
    module.exports.fsaveTmpFileToYun = saveTmpFileToYun
    module.exports.LOCAL_FTP = LOCAL_FTP
    module.exports.fccdir = ccdir
    module.exports.fgetLocalPaths = () => {
        return localPaths
    }

    // init file specialAreas
    loopReLocalSpace()
}

function okcompback(res, callback) {
    try {
        const code = (res.errMsg.endsWith(":ok"))
        if (!code) {
            app.alog.lerror(res, "cfile default callback")
        }
        if (typeof callback == "function") {
            callback(code, res)
        } else {
            app.alog.linfo("cfile default callback")
        }
    } catch (e) {
        app.alog.lerror(e)
    }
}

function getFtpath(path) {
    var ftpath = null
    if (localPaths.indexOf(path) >= 0) {
        ftpath = LOCAL_FTP + path
    } else if (path != null && path != "" && app.setts.network == true) {
        ftpath = YUN_FTP + path
    }
    app.alog.linfo("get ftp path:" + ftpath)
    return ftpath
}

function downAllYunToLocal(callback) {
    app.adatabase.dQuery({
        where: {_id: app.setts.subid},
        field: {infos: true, heads: true}
    }, (code, res) => {
        if (code) {
            const waitDowns = []//[{info,kinfo}]
            const heads = res[0].heads
            const infos = res[0].infos
            for (var kcode in infos) {
                const info = infos[kcode]
                for (var i in heads) {
                    const kinfo = heads[i]
                    if (["string", "number"].indexOf(kinfo.vtype) < 0) {
                        waitDowns.push({
                            info: info,
                            hinfo: kinfo
                        })
                    }
                }
            }
            app.aconfirms.cshow("down voice by network?", () => {
                downFileToLYByInfos(waitDowns, true, callback)
            }, () => {
                downFileToLYByInfos(waitDowns, false, callback)
            })
        } else app.aconfirms.cshow("down is fail.")
    })
}

/**
 *
 * @param waitDowns [{info,hinfo:{text:zhvoice,vtype:voice}}]
 * @param isDownVoiceByNetwork
 * @param callback
 */
function downFileToLYByInfos(waitDowns, isDownVoiceByNetwork, callback) {
    if (waitDowns.length > 0) {
        const wd = waitDowns.splice(0, 1)[0]
        const hinfo = wd.hinfo
        const info = wd.info
        const fpath = info[hinfo.text]
        if ([null, ""].indexOf(fpath) >= 0 && isDownVoiceByNetwork && hinfo.vtype == app.avoice.VC) {
            //down voice by network
            const playk = hinfo.text.split(app.avoice.VC)[0]
            return app.avoice.fdownTTSToLY(info, playk, (code) => {
                downFileToLYByInfos(waitDowns, isDownVoiceByNetwork, callback)//next
            })
        } else if (localPaths.indexOf(fpath) < 0 && typeof fpath == "string" && fpath.length > 0) {
            //down yun file
            return downYunToTmp(fpath, (code, tmpath) => {
                if (code) {
                    copyTmpFileToLocal(tmpath, fpath, (code) => {
                        downFileToLYByInfos(waitDowns, isDownVoiceByNetwork, callback)//next
                    })
                }
            })
        } else downFileToLYByInfos(waitDowns, isDownVoiceByNetwork, callback)//next
    } else if (typeof callback == "function") {
        app.alog.linfo("down is end. count:" + localPaths.length)
        callback(true)
    }
}

function downUrlToTmp(url, dstPath, callback) {
    if (app.setts.network != true) {
        app.alog.lerror(null, "app.setts.network is false")
        if (typeof callback == "function") {
            callback(0)
        }
    } else {
        wx.showLoading({
            title: "down url to tmp...",
            mask: true//防止触摸
        })
        const dparams = {
            url: url,
            complete: (res) => {
                okcompback(res, (code) => {
                    wx.hideLoading()
                    var tmpPath = dstPath
                    if (code) {
                        if (dstPath == null) {
                            tmpPath = res.tempFilePath
                        }
                        app.alog.linfo("down " + url + " to " + tmpPath)
                    }
                    if (typeof callback == "function") {
                        callback(code, tmpPath)
                    }
                })
            }
        }
        if (dstPath != null) {
            dparams.filePath = (LOCAL_FTP + dstPath)
        }
        wx.downloadFile(dparams)
    }
}

function downYunToTmp(path, callback) {
    if (app.setts.network != true) {
        app.alog.lerror(null, "app.setts.network is false")
        if (typeof callback == "function") {
            callback(0)
        }
    } else {
        const ypath = YUN_FTP + path
        const msg = "down " + ypath + " by yun to tmp..."
        app.alog.linfo(msg)
        wx.showLoading({
            title: msg,
            mask: true//防止触摸
        })
        wx.cloud.downloadFile({
            fileID: ypath,
            complete: (res) => {
                okcompback(res, (code) => {
                    wx.hideLoading()
                    if (typeof callback == "function") {
                        callback(code, res.tempFilePath)
                    }
                })
            }
        })
    }
}

function writeToLocal(fdata, lpath, sep, callback, encoding) {
    wx.showLoading({
        title: 'writ...',
        mask: true//防止触摸
    })
    if (sep != null) {
        sep = "." + sep
    } else sep = ""
    ccdir(LOCAL_FTP + lpath, (ccode) => {
        if (ccode) {
            FSM.writeFile({
                filePath: LOCAL_FTP + lpath,
                encoding: encoding ? encoding : "binary",
                data: fdata,
                complete: res => {
                    okcompback(res, (wcode) => {
                        wx.hideLoading()
                        //add to lpaths
                        if (wcode) {
                            app.alog.linfo("write to " + LOCAL_FTP + lpath + sep)
                            //refush lpaths,space
                            const i = localPaths.indexOf(lpath)
                            if (i < 0) {
                                localPaths.push(lpath)
                                app.setts.file.space.sval += (fdata.length / LOCAL_MSIZE * 100)
                            }
                        } else app.alog.lerror(null, "write to " + (LOCAL_FTP + lpath + sep) + " is fail.")
                        //callback
                        if (typeof callback == "function") {
                            callback(wcode, lpath)
                        }
                    })
                }
            })
        } else if (typeof callback == "function") {//callback
            callback(code, lpath)
        }
    })
}

function readLocalFile(fpath, callback) {
    wx.showLoading({
        title: 'read...',
        mask: true//防止触摸
    })
    FSM.readFile({
        filePath: LOCAL_FTP + fpath,
        encoding: "utf-8",
        complete: res => {
            wx.hideLoading()
            okcompback(res, (code, ores) => {
                if (code) {
                    if (typeof callback == "function") {
                        callback(code, ores.data)//res.data is str
                    }
                }
            })
        }
    })
}

/**
 * save file to yun and local
 * @param tmpath
 * @param dstpath
 * @param sep
 * @param callback
 */
function saveTmpFileToLY(tmpath, dstpath, callback, sep = null) {
    if (sep == null) {
        // sep = tmpath.match(/\.[^.]+?$/)[0]//.jpg
        sep = tmpath.match(/[^.]+?$/)[0]//jpg
    }
    const codePath = dstpath.split("/").map(d => d.split("").map(c => c.charCodeAt()).join("")).join("/") + "." + sep
    //save to local
    copyTmpFileToLocal(tmpath, codePath, (code) => {
        if (code) {
            //save to yun
            saveTmpFileToYun(tmpath, codePath, callback)
        } else if (typeof callback == "function") {
            callback(code)
        }
    })
}

function saveTmpFileToYun(tmpath, codepath, callback) {
    if (app.setts.network != true) {
        app.alog.lerror(null, "app.setts.network is false")
        if (typeof callback == "function") {
            callback(0)
        }
    } else {
        wx.cloud.uploadFile({
            filePath: tmpath,
            cloudPath: codepath,
            complete: (res) => {
                try {
                    const code = ([200, 204].indexOf(res.statusCode) >= 0)
                    if (code) {
                        app.alog.linfo("save " + tmpath + " to yun " + res.fileID)
                    } else {
                        app.alog.lerror(res, "load file is fail.")
                    }
                    if (typeof callback == "function") {
                        callback(code, codepath)
                    }
                } catch (e) {
                    if (typeof callback == "function") {
                        callback(false, codepath)
                    }
                    app.alog.lerror(e)
                }

            }
        })
    }
}

function copyTmpFileToLocal(tmpath, codepath, callback) {
    const lpath = LOCAL_FTP + codepath
    ccdir(lpath, (code) => {
        if (code) {
            //get file stats
            FSM.stat({
                path: tmpath,
                complete: (res) => {
                    okcompback(res, (code) => {
                        if (code) {
                            //if is file
                            if (res.stats.isFile()) {
                                const msize = res.stats.size / 1024 / 1024
                                //copy file
                                FSM.copyFile({
                                    srcPath: tmpath,
                                    destPath: lpath,
                                    complete: (cres) => {
                                        okcompback(cres, (code) => {
                                            //add to lpaths
                                            if (code) {
                                                app.alog.linfo("copy " + tmpath + " to " + lpath)
                                                //refush lpaths,space
                                                const i = localPaths.indexOf(codepath)
                                                if (i < 0) {
                                                    localPaths.push(codepath)
                                                    app.setts.file.space.sval += (msize / LOCAL_MSIZE * 100)
                                                }
                                            }
                                            if (typeof callback == "function") {
                                                callback(code)
                                            }
                                        })
                                    }
                                })
                            } else {
                                app.alog.lerror(null, "fail operation not permitted, copyFile")
                                if (typeof callback == "function") {
                                    callback(false)
                                }
                            }
                        } else if (typeof callback == "function") {
                            callback(code)
                        }
                    })
                }
            })
        } else if (typeof callback == "function") {
            callback(code)
        }
    })
}

function cleanLocalFile(callback) {
    if (localPaths.length == 0) {
        app.alog.linfo("local file count is 0.")
    }
    app.aconfirms.cshow("clear local files?", () => {
        localPaths.map(path => removeLocalFile(path, callback))
    }, () => {
    })
}

function removeLYFile(path, callback) {
    removeLocalFile(path, (code) => {
        if (code) {
            //save to yun
            removeYunFiles([path], callback)
        } else if (typeof callback == "function") {
            callback(code)
        }
    })
}

function removeYunFiles(paths, callback) {
    const ypaths = paths.map(p => YUN_FTP + p)
    wx.cloud.deleteFile({
        fileList: ypaths,//[id1,...]
        complete: (res) => {
            try {
                //log,code
                const code = (res.fileList instanceof Array && res.fileList.filter((r, i) => {
                    app.alog.linfo("del yun file " + ypaths[i] + " " + r.errMsg)
                    r.errMsg != "ok"
                }).length == 0)
                if (typeof callback == "function") {
                    callback(code)
                }
            } catch (e) {
                app.alog.lerror(e)
            }
        }
    })
}

function removeLocalFile(path, callback) {
    const lpath = LOCAL_FTP + path
    //get file stats
    FSM.stat({
        path: lpath,
        complete: (res) => {
            okcompback(res, (code) => {
                if (code) {
                    //if is file
                    if (res.stats.isFile()) {
                        const msize = res.stats.size / 1024 / 1024
                        //remove file
                        FSM.unlink({
                            filePath: lpath,
                            complete: (ures) => {
                                okcompback(ures, (code2) => {
                                    if (code2) {
                                        app.alog.linfo("remove " + lpath)
                                        //refush lpaths,space
                                        const i = localPaths.indexOf(path)
                                        if (i >= 0) {
                                            localPaths.splice(i, 1)
                                            app.setts.file.space.sval -= (msize / LOCAL_MSIZE * 100)
                                        }
                                    }
                                    //callback
                                    if (typeof callback == "function") {
                                        callback(code2)
                                    }
                                })
                            }
                        })
                    } else {
                        app.alog.lerror(null, "path is not file.")
                        if (typeof callback == "function") {
                            callback(false)
                        }
                    }
                } else if (res.errMsg.indexOf("no such file or directory") >= 0) {
                    if (typeof callback == "function") {
                        callback(true)
                    }
                } else if (typeof callback == "function") {
                    callback(code)
                }
            })
        }
    })
}

function loopReLocalSpace(callback, path) {
    if (path == null) {
        path = ""
        localPaths = []
        app.setts.file.space.sval = 0
    }
    FSM.readdir({
        dirPath: LOCAL_FTP + path,
        complete: (rres) => {
            okcompback(rres, (rcode) => {
                if (rcode) {
                    for (var i in rres.files) {
                        const npath = (path.startsWith("/") ? path.substr(1) : path) + "/" + rres.files[i]
                        FSM.stat({
                            path: LOCAL_FTP + npath,
                            complete: sres => okcompback(sres, (scode) => {
                                if (scode) {
                                    if (sres.stats.isFile() && localPaths.indexOf(npath) < 0) {
                                        const fsize = sres.stats.size / 1024 / 1024//MB
                                        localPaths.push(npath)
                                        app.setts.file.space.sval += (fsize / LOCAL_MSIZE * 100)
                                        // app.alog.linfo("add " +LOCAL_FTP+ npath + " size:"+fsize+"MB")
                                        if (typeof callback == "function") {
                                            app.alog.linfo("local space:" + app.setts.file.space.sval.toFixed(2) + "% count:" + localPaths.length)
                                            callback(scode)
                                        }
                                    } else if (sres.stats.isDirectory()) {
                                        loopReLocalSpace(callback, npath)
                                    }
                                }
                            })
                        })
                    }
                } else if (typeof callback == "function") {
                    callback(false)
                }
            })
        }
    })
}

/**
 * check dir,create dir
 * @param filePath
 */
function ccdir(filePath, callback) {
    const dirPath = filePath.split("/").reverse().filter((p, i) => (i > 0)).reverse().join("/")
    FSM.access({
        path: dirPath,
        complete: (sres) => {
            okcompback(sres, (acode) => {
                if (acode) {
                    app.alog.linfo("dir is cover " + dirPath)
                    if (typeof callback == "function") {
                        callback(acode)
                    }
                } else {
                    FSM.mkdir({
                        dirPath: dirPath,
                        recursive: true,
                        complete: (mres) => {
                            okcompback(mres, (mcode) => {
                                if (mcode) {
                                    app.alog.linfo("mkdir " + dirPath)
                                }
                                if (typeof callback == "function") {
                                    callback(mcode)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}




