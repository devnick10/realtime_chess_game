import { server } from "./index.js";
import { conf } from "./config/confg.js";





const PORT = conf.port;
function startServer() {

     
server.listen(PORT,()=>{
       
     console.log(`SERVER IS RUNNING AT PORT || ${PORT}`);
     

    })


}
startServer();





