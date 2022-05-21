export class AcGame{
    constructor(id, AcWingOS){
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;  //  区分是在acapp还是web里执行的

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }
    start() {}
    }
