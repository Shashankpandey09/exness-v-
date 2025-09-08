export class lastProcessedId{
    private static instance:lastProcessedId;
    private processedId;
   private constructor() {
    this.processedId='0-0'
   }


    public static getInstance():lastProcessedId{
        if(!lastProcessedId.instance) return lastProcessedId.instance=new lastProcessedId()
           return lastProcessedId.instance 
    }
    public setLastProcessedId(id:string){
        this.processedId=id;
    }
    public getLastProcessedId(){
        return this.processedId
    }
}