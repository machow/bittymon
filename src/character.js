function Character(){
    var self = {
        items: {},
        bitty: [],
        state: {},
        history: {},
        misc: {},
        bittyMax: 6,
        addItem,
        rmItem,
        addBitty,
        rmBitty,

    };
    return self;

    function addItem({id, n=1}){
        var nItem = this.items[id];
        this.items[id] = nItem ? nItem + n : n;
    }

    function rmItem({id, n=1}){
        if (!this.items[id] || this.items[id] - n < 0)
            // TODO: trigger error event
            // item either doesn't exist or took out too many
            console.log(`${id} only has ${this.items[id]}, but n = ${n}`);
        else 
            this.items[id] -= n;
    }        

    function addBitty(obj){
        // TODO validate bitty obj
        if (self.bitty.length > self.bittyMax)
            console.log(`yo, you have ${self.bitty.length} bittymons already!`);
        else self.bitty.push(obj);
    }

    function rmBitty({id}){
        // check you have the bittymon
        var released = false;
        for (let ii=0; ii < this.bittymon.length; ii++){
            if (this.bittymon[ii].id == id) {
                console.log(`you set ${id} free!`);
                this.bittymon.splice(ii, 1);
                released = true;
                break
            }
        }
        if (!released)
            console.log(`yo, you don't have the bittymon ${id}`);

    }
}
