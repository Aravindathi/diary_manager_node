import  jwt  from "jsonwebtoken";


 
 const auth=(request,response,next)=>{
     
    try{
       const Unique_Key = "abcd"
       const token=request.header("x-auth-token");
       jwt.verify(token,Unique_Key);
       next();
    }
    catch (err){
            response.send("I am crashing");
    }
  
}


export default auth