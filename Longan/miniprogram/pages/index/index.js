//index.js
const app = getApp()

Page({
    data: {
        butts: [{
            text: "setts",
            tapEvent: "ftoSettPage",
        }],
        vheight: wx.getSystemInfoSync().windowHeight,//获取当前窗口的高度 px
        swipers: [
            // {
            //     text: skey,
            //     image: {
            //         path: app.utils.fs.fgetFtp(info.image),
            //         style: ""
            //     },
            //     info: info,
            //     isCorr:null,
            //     exam:{
            //         title:"",//pro/max,e/c
            //         inputs:[],//[{text,itype,style,inputv}]
            //         answer:{},//{image,text,style}
            //         o4:[]//[{image,text}]
            //     },
            // }
        ],
        swiperIndex: 0,
    },

    onLoad: function () {
        app.scrollNum = 0
        app.callbacks.push((code) => {
            if (code) {
                for (var i = 0; i < 2; i++) {
                    this.newSwiper()
                }
            }
        })
    },
    newSwiper: function () {
        if (this.data.swipers.length > app.utils.setts.fcache().maxProgress) {
            app.utils.logs.linfo("to first")
            this.data.swiperIndex = 0
            this.data.swipers.splice(0, app.utils.setts.fcache().maxProgress)
            app.utils.fzk.frefushAll()
        }
        var info = app.utils.fzk.fnextInfo()
        if (info == null) {
            app.utils.fzk.frefushAll()
            this.newSwiper()
        } else {
            const skey=info[app.utils.setts.fcache().skey]
            this.data.swipers.push(
                {
                    text: skey,
                    image: {
                        path: app.utils.fs.fgetFtp(info.image),
                        style: ""
                    },
                    info: info,
                    isCorr:null,
                    exam:{
                        title:"",//pro/max,e/c
                        inputs:[],//[{text,itype,style,inputv}]
                        answer:{},//{image,text,style}
                        o4:[]//[{image,text}]
                    },
                })
            this.setData(this.data)
        }
    },
    // 滑动事件
    fscrollEvent: function (e) {
        // console.info(e.detail.current)
        // play voice
        if(e.detail.current!=this.data.swiperIndex){
            app.utils.tts.fvplay(this.data.swipers[e.detail.current].info, app.utils.setts.fcache().skey)
        }

        if (this.data.swipers.length - 1 <= e.detail.current) {
            // wx.showLoading({
            //     title: 'loading...',
            //     mask:true//防止触摸
            // })
            //refush progress
            this.data.swiperIndex = e.detail.current
            this.setData(this.data)
            this.newSwiper()
            // wx.hideLoading()
        }
    },
    fOpenSameEvent(e) {
        const current = e.currentTarget.dataset.event1Params1
        const swiper=this.data.swipers[current]
        //hide image
        swiper.image.style="display:none"
        //open exam
        if(swiper.isCorr==null){
            //fzkt
            const info=swiper.info
            var fzkt=app.utils.setts.fcache().fzkts[info.c]//[zhvoice,en]
            if(fzkt==null){
                fzkt=app.utils.setts.fcache().fzkts[23]
            }
            //title
            swiper.exam.title=((this.data.swiperIndex+1)+"/"+app.utils.setts.fcache().maxProgress+","+info.e+"/"+info.c)
            //answer
            swiper.exam.answer=this.getAnswer(fzkt[0],info)
            //get fill choice
            if(fzkt[1].indexOf("edi")>=0){
                //fill
                swiper.exam.inputs=this.getFillInputs(fzkt[1],info)
                swiper.exam.answer.style="height:calc(100% - 60px)"
            }else {
                //choice
                swiper.exam.o4=this.getO4(fzkt[1],info)
            }
        }
        this.setData(this.data)
    },
    getFillInputs(fzkt1,info){
        const text=info[app.utils.setts.fcache().skey]
        if (fzkt1 == "edit") {
            return [{
                text: text,
                itype: "input",
                inputEvent: "fInputCheck", inputv: "",
                focus: true,
                style: "width:calc( " + text.length + " * 4vw )"
            }]
        } else {
            //edi get inputs by random
            return this.getInputsByRandom(text,info)
        }
    },
    getInputsByRandom(text,info){
        //leaf arr
        const LEAF = "$LEAF$"
        const leafs = info.leafs.split(",")
        //apcxxdef=>apc$LEAF$def
        leafs.map(leaf => text = text.replace(leaf, LEAF))
        //split all =>["a", "p", "c", "$LEAF$1", "d", "e", "f"]
        const SEP = "$SEP$"
        const tarr = text.split(LEAF).map((k, i) =>
            (i > 0 ? [LEAF + i].concat(k.split("")) : k.split("")).join(SEP)
        ).join(SEP).split(SEP)
        //if ["", "$LEAF$1", "a", "p", "c", "d", "e", "f"] remove ""
        if(tarr[0]==""){
            tarr.splice(0,1)
        }
        //to input
        var inputCount=0
        const inputs = []
        for (var i in tarr) {
            var k = tarr[i]
            //re leaf
            var isLeaf=false
            if (k.startsWith(LEAF)) {
                isLeaf=true
                k = leafs[k.split(LEAF)[1] - 1]
            }
            //add input
            if((i>0&&k!=" "&&
                Math.random() <= app.utils.setts.fcache().filLetteRadio)//需要输入的字母百分比
                ||(i==tarr.length-1&&inputCount==0)
            ){
                const aftInput = inputs[inputs.length - 1]
                if (isLeaf==false&&aftInput.itype == "input" && Math.random() >= 0.5555) {
                    //随机合并 leaf not 合并
                    aftInput.text += k
                    aftInput.style = "width:calc( " + aftInput.text.length + " * 4vw )"
                } else {
                    inputCount+=1
                    //new input
                    inputs.push({
                        text: k,
                        itype: "input",
                        inputEvent: "fInputCheck", inputv: "",
                        focus: inputCount==1?true:false,
                        style: "width:calc( " + k.length + " * 4vw )"
                    })
                }
            } else {
                //first or " " is text
                inputs.push({text: k, itype: "text", tapEvent: "", style: ""})
            }
        }

        return inputs
    },
    fInputCheck(e){
        const inputStr = e.detail.value.trim()
        const iarr = e.target.dataset.event1Params1.split(",")
        const si=iarr[0]
        const i=parseInt(iarr[1])
        //refush inputv
        const inputs=this.data.swipers[si].exam.inputs
        //check is pri
        if(inputStr==""&&inputs[i].inputv.length>0){
            inputs[i].inputv = inputStr
            for(var j = i-1;j>=0;j--){
                // next
                if(inputs[j].itype=="input"){
                    inputs[i].focus=false
                    inputs[j].focus=true
                    break;
                }
            }
        }else{
            inputs[i].inputv = inputStr.substr(0, inputs[i].text.length)
            //check is next,or end
            if(inputs[i].inputv.length==inputs[i].text.length){
                var isEnd=true
                for(var j = i+1;j<inputs.length;j++){
                    // next
                    if(inputs[j].itype=="input"){
                        inputs[i].focus=false
                        inputs[j].focus=true
                        isEnd=false
                        break;
                    }
                }
                // end
                if(isEnd){
                    this.fillCorr(inputs,si)
                }
            }
        }

        this.setData(this.data)
    },
    fillCorr(inputs,si){
        var errNum=0
        for(const i in inputs){
            if(inputs[i].itype=="input"){
                if(inputs[i].text!=inputs[i].inputv){
                    inputs[i].style+=";color:red"
                    errNum+=1
                }else{
                    inputs[i].style=inputs[i].style.split(";")[0]
                }
            }
        }
        this.reCorr(errNum==0,si)
    },
    reCorr(isCorr, si){
        const swiper=this.data.swipers[si]
        //save to db
        if(swiper.isCorr==null){
            swiper.exam.title=((this.data.swiperIndex+1)+"/"+app.utils.setts.fcache().maxProgress+","+(isCorr?swiper.info.e:(swiper.info.e+1))+"/"+(swiper.info.c+1))
            app.utils.fzk.fsaveCorr(swiper.info,isCorr)
        }
        //refush view
        swiper.isCorr=isCorr
        swiper.image.path="/images/"+(isCorr?"succ":"err")+".jpg"
        swiper.image.style=""
        this.setData(this.data)
    },
    getAnswer(fzkt0,info){
        const answer={
            image:null,
            text:null
        }
        if(fzkt0=="image"){
            answer.image=app.utils.fs.fgetFtp(info.image)
        }else if(fzkt0.endsWith("voice")){
            answer.image="/images/voice.jpg"
        }else {
            answer.text=info[fzkt0]
        }
        return answer
    },
    fclickAnswer(e){
        // play voice
        const si=e.currentTarget.dataset.event1Params1
        app.utils.tts.fvplay(this.data.swipers[si].info, app.utils.setts.fcache().skey)
    },
    getO4(fzkt1,info){
        const o4=[]
        const o4Infos=app.utils.fzk.fgetO4(info)
        for (var i in o4Infos) {
            const o={
                image:null,
                text:null
            }
            //image path
            if(fzkt1=="image"){
                o.image=app.utils.fs.fgetFtp(o4Infos[i].image)
            }else {
                o.text=o4Infos[i][fzkt1]
            }
            o4.push(o)
        }
        return o4
    },
    ftoSettPage() {
        wx.navigateTo({
            url: "/pages/setts/setts",
        })
    }
})
