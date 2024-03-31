console.log("Let's write some javaScript");
async function main(){
    let a= await fetch("http://127.0.0.1:5500/Spotify%20Project/Songs/");
    let response=await a.text();
    console.log(response);
    
}
main();