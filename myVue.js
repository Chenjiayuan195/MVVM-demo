
class myVue{
  constructor(obj={}){
    this.$el=obj.el;
    this.$data=obj.data;
    this._binding={};//用于data中的值监听
    this._observe(this.$data);
    this._complie(this.$el);
  }
  /*观察者*/
  _observe(_data){
    let _this=this;
    for(var key in _data){
      let value;
      if(typeof _data[key]==='object'){
        _this._observe(_data[key]) //递归直到不为对象为止
      }
      _this._binding[key]={  //此处将当前key值存入对象中，用于watcher绑定
        _watcherList:[]
      }
      value=_data[key];
      _this._define(_data,key,value);
    }
  }

  /*数据劫持*/
  _define(_data,key,value){
    let _this=this;
    Object.defineProperty(_data,key,{
      enumerable: true,
      configurable: true,
      get(){
        return value;
      },
      set(newValue){
        if(newValue!=value){
          value=newValue;
          if(!Object.is(_this.$data,_data)){//判断是否二重对象
            Object.keys(_this.$data).forEach((val)=>{
              Object.is(_this.$data[val],_data)&&
              _this._binding[`${val}.${key}`]._watcherList.forEach((item)=>{ //有值更新对应更新watcher的update
                item.update();
              })
            })
          }else{
            _this._binding[key]._watcherList.forEach((item)=>{ //有值更新对应更新watcher的update
              item.update();
            })
          }
        }
      }
    })
  }

  /*模板解析*/
  _complie(root){
    let _this=this;
    let _node=document.querySelector(root),
    _nodeList=_node.children;
    for(var ele of _nodeList){
      let _modelVal=ele.getAttribute('v-model');
      if(_modelVal){
        if(ele.nodeName=='INPUT'){
          let ide='value';
          _this._bind(ele,_this,_modelVal,ide)
          ele.addEventListener('input',(e)=>{
            let _newVal=e.target.value;
            let _objArray=_modelVal.split('.');
            if(_objArray.length>1){//此处实现的输入时双向的数据绑定
                _object(_this.$data,_objArray,_newVal);
            }else{
                _this.$data[_modelVal]=_newVal;
            }
          })
        }
      }else if(!_this._check(ele.innerHTML)){
        ele.innerHTML.replace(/^(\{\{)([a-zA-Z0-9.]+)(\}\})$/ig,(val,$1,$2,$3)=>{
          let ide='innerHTML';
          _this._bind(ele,_this,$2,ide);
           ele.innerHTML=_array($2,_this.$data)||'';
        })
      }
    }
  }

/*对当前数据进行监听*/
  _bind(ele,vm,newVal,ide){
    let _this=this;
    if(!_this._binding[newVal]){//此处将当前key值存入对象中，用于watcher绑定
      _this._binding[newVal]={
        _watcherList:[]
      }
    }
    _this._binding[newVal]._watcherList.push(new Watcher(
      ele,
      vm,
      newVal,
      ide
    ))
  }

/*校验{{}}*/
  _check(input){
    input=input.split('');
    return input.reduce((pre,cur)=>{
      if(pre<0)return pre;
      switch (cur) {
        case '{':
        ++pre;
        return pre
        case '}':
        --pre;
        return pre
        default:
        return pre
      }
    },0)
  }
}


/*监听者函数*/
class Watcher{
  constructor(node,vm,value,ide){
    this.$el=node;
    this.$vm=vm;
    this.$value=value;
    this.$ide=ide;
  }
  update(){
    let _this=this;
    let _valArray=_this.$value.split('.');
    if(_valArray.length>1){
      _this.$el[_this.$ide]=_array(_this.$value,_this.$vm.$data);
    }else{
      _this.$el[_this.$ide]=_this.$vm.$data[_this.$value];
    }
  }
}

/*多重对象取值*/
_array=(str,init)=>{
    let _valArray=str.split('.');
    return _valArray.reduce((pre,cur)=>{
      return pre[cur];
    },init)
}

/*多重对象赋值*/
_object=(data,objArray,newVal)=>{
  let index=objArray.shift();
  if(objArray.length!=0){
  _object(data[index],objArray,newVal)
  }else{
    data[index]=newVal;
  }
}
