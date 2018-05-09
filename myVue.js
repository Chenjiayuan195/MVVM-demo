
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
      Object.defineProperty(_data,key,{
        enumerable: true,
        configurable: true,
        get(){
          return value;
        },
        set(newValue){
          if(newValue!=value){
            value=newValue;
            _this._binding[key]._watcherList.forEach((item)=>{ //有值更新对应更新watcher的update
              item.update();
            })
          }
        }
      })
    }
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
            _this.$data[_modelVal]=_newVal; //此处实现的输入时双向的数据绑定
          })
        }
      }else if(!_this._check(ele.innerHTML)){
        ele.innerHTML.replace(/^(\{\{)(\w+)(\}\})$/ig,(val,$1,$2,$3)=>{
          let ide='innerHTML'
          _this._bind(ele,_this,$2,ide);
           ele.innerHTML=_this.$data[$2]||'';
        })
      }
    }
  }

/*对当前数据进行监听*/
  _bind(ele,vm,newVal,ide){
    let _this=this;
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
    this.ide=ide;
  }
  update(){
    let _this=this;
    _this.$el[_this.ide]=_this.$vm.$data[_this.$value];
  }
}
