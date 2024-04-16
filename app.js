async function getSongs() {
    return await fetch('http://127.0.0.1:5500/HarryExercises/Spotify%20Project/Songs/')
        .then(response => response.text())
        .then(html => {
            let parser = new DOMParser();                        
            let htmlDoc = parser.parseFromString(html, 'text/html');            
            let songElements = htmlDoc.querySelectorAll('a');

            let arrayLis=Array.from(songElements);            
            let songAList=arrayLis.filter((element)=>{
                return element.href.endsWith(".mp3");
            })
            let songsURL=[];
            for (let index = 0; index < songAList.length; index++) {
                const element = songAList[index];
                if(element.href.endsWith('.mp3')){
                    songsURL.push(element.href);
                }
            }      
            return songsURL;      
        })
        .catch(error => console.error(error));
}
let ulTag=document.querySelector(".playbar").querySelector('ul');
let songNames=[];
async function main(){
    let songURLs=await getSongs();
    for (let index = 0; index < songURLs.length; index++) {
        const element = songURLs[index];
        songNames.push(element.split("/Songs/")[1].replaceAll("%20"," "));
    }    
    for (const song of songNames) {
        let li= document.createElement("li");
        li.innerText=song;
        ulTag.appendChild(li);  
    }
}
main();


