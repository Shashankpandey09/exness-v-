//getting the ask price or sell price they both are a bit same here
export class PollerManager{
    private static instance:PollerManager;
    private latestStream=new Map<string,any>();
    
    private constructor(){}
    public static getInstance():PollerManager{
     if(!this.instance){
        this.instance=new PollerManager();
        return this.instance
     }
     return this.instance
     
    }
    public set(symbol:string,askPrice:number,decimals:number){
       this.latestStream.set(symbol,{asset:symbol,price:askPrice,decimals})
      
    }
    public get(){
        return [...this.latestStream.values()];
    }
}