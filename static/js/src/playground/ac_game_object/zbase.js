let AC_GAME_OBJECTS = [];  //全局数组，每秒钟这个数组里的所有对象都会被调用60次

class AcGameObject {  //简易的游戏引擎, 所有会动的类以它为父类, 所有以这个类为基类的对象每一帧都会调用它的刷新函数
    constructor() { //构造函数
        AC_GAME_OBJECTS.push(this);  //  一旦创建这个类的对象(this)就会被加入到全局数组中

        this.has_called_start = false;  // 判断是否执行过start函数
        this.timedelta = 0;  //当前帧距离上一帧的时间间隔, 单位ms
    }

    start() { //对象刚出现的时候会初始化一些属性(颜色、大小、速度...), 但只会在第一帧执行一次
    }  //  虽然函数体是空的但未来继承它的类会重载这个函数

    update() { //有些操作(比如渲染render()...)需要每一帧都执行
    }  //  虽然函数体是空的但未来继承它的类会重载这个函数

    on_destroy() { //在被销毁前执行一次, 在被删除前可能需要给对手加点属性(舔包之类的)
    }

    destroy() { //删掉该物体, 将它从全局数组里面移除
        //  yxc: 在js中当一个对象没有被任何变量存下来的时候, 它就会被自动释放掉
        this.on_destroy();

        for(let i = 0; i < AC_GAME_OBJECTS.length; i ++) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);  //  从i开始删一个
                break;
            }
        }
    }
}

let last_timestamp;

let AC_GAME_ANIMATION = function(timestamp) {  //  时间戳timestamp:系统自动给出不需要我们去赋值
    for(let i = 0; i < AC_GAME_OBJECTS.length; i ++){  //  遍历全局数组里的所有物体执行update函数
        let obj = AC_GAME_OBJECTS[i];  //  用obj存当前物体
        if(!obj.has_called_start) {  //  在第一帧执行start函数, 以后就不会再执行了
            obj.start();
            obj.has_called_start = true;  //  标记为true之后就不会再执行start函数了
        } else {  //  在以后的每一帧执行update函数
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;  //  last_timestamp不用初始化是因为第一帧会给它赋值(第一帧不会执行else中的语句)

    requestAnimationFrame(AC_GAME_ANIMATION);  //  递归调用
}

//  js提供的api, 这个函数在一秒钟内会被调用60次
//  最开始:第一次从这里执行调用AC_GAME_ANIMATION后的function函数, 我也不是很懂反正知道它1s能执行60次就行
//  至此简易版游戏引擎就实现了
requestAnimationFrame(AC_GAME_ANIMATION);