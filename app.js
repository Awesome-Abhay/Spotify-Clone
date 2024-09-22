let folderNames=[];
let folderKaNaam=null;
async function getSongs() {    
    let a=await fetch(`http://127.0.0.1:5500/songs/${folderKaNaam}`);
    let response = await a.text();
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(response, "text/html");
    let as = htmlDoc.querySelectorAll("a");
    let songsURL = [];
    as.forEach((e) => {
        if (e.href.endsWith(".mp3")) songsURL.push(e.href);
    })

    return songsURL;
}


let currentVolume= 0.5;
let playButton = document.querySelector(".handles").querySelector(".middlePlayButton");
let currentShadowElement = null;
let currentPauseElement = null;
let currentSong = new Audio();

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Ensure seconds are always displayed as two digits
    const paddedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    // Ensure minutes are always displayed as two digits
    if (minutes < 10) minutes = '0' + minutes;

    return `${minutes}:${paddedSeconds}`;
}

function playMusic(track, e) {    

    // handling song info and duration
    currentSong.addEventListener("timeupdate", () => {
        let time = formatTime(currentSong.currentTime);
        let currentTime = time.split(":")[0] + ":" + time.split(":")[1].split(".")[0];
        let duration = formatTime(Math.floor(`${currentSong.duration}`));

        document.querySelector(".playSystem").querySelector(".songInfo").innerHTML = track;
        document.querySelector(".playSystem").querySelector(".duration").innerHTML = `${currentTime}/${duration}`;

        document.querySelector(".seekButton").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".seekFiller").style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    let source = `songs/${folderKaNaam}/${track}`;
    let toCheck = currentSong.src.split("/songs/")[1];    

    if (currentSong.src=="" || toCheck.replaceAll("%20", " ") != track) {
        currentSong.src = source;
        currentSong.play();
        playButton.querySelector("img").src = `./svgs/pause.svg`;
        if (currentPauseElement)
            currentPauseElement.querySelectorAll("img")[1].src = `./svgs/playButton.svg`;
        currentPauseElement = e;
        e.querySelectorAll('img')[1].src = `./svgs/pause.svg`;
    } else {
        if (currentSong.paused) {
            currentSong.play();
            playButton.querySelector("img").src = `./svgs/pause.svg`;
            e.querySelectorAll('img')[1].src = `./svgs/pause.svg`;
        } else {
            currentSong.pause();
            playButton.querySelector("img").src = `./svgs/circlePlayWhite.svg`;
            currentPauseElement.querySelectorAll("img")[1].src = `./svgs/playButton.svg`;
        }
    }
}

let playlist= document.querySelector(".playlists");
let ulTag = document.querySelector(".playbar").querySelector('ul');
let songNames = [];

async function listing(){
    // collecting song names in variable "songNames"
    songNames=[];
    let songURLs = await getSongs();
    for (let index = 0; index < songURLs.length; index++) {
        const element = songURLs[index];        
        songNames.push(element.split(`/${encodeURI(folderKaNaam)}/`)[1].replaceAll("%20", " "));
    }
    songURLs=[];
    ulTag.innerHTML="";
    
    // listing all songs in our playlist.
    for (const song of songNames) {
        let li = document.createElement("li");
        li.classList.add("flex");
        li.innerHTML =
            `<div class="flex">
                                <img src="./svgs/music.svg">
                                <div class="song flex">
                                    <p>${song}</p>
                                    <p>Harry</p>
                                </div>
                            </div>
                            <img src="./svgs/playbutton.svg">`;
        ulTag.append(li);
    }    
}

async function main() {

    currentSong.volume=0.5;
    document.querySelector(".range").value=50;
    
    // fetching Albums
    let albums = await fetch("http://127.0.0.1:5500/songs/");
    albums= await albums.text();
    let parser= new DOMParser();
    albums = parser.parseFromString(albums, "text/html");
    let lis=albums.querySelectorAll("li");
    lis.forEach((e)=>{
        let tempNames= e.innerHTML.split(`title="`)[1];
        let temp="";
        let i=0;
        for(; i<tempNames.length; i++){
            if(tempNames.charAt(i)==`"`){
                break;
            }
            temp+=tempNames.charAt(i);
        }
        folderNames.push(temp);
        
    })
    folderNames.shift();
    folderNames.forEach((e)=>{        
        let div= document.createElement("div");
        div.classList.add("card");
        div.innerHTML=`<div class="wrapper flex">
                            <div class="pic">
                                <img src="./songs/${e}/${e}.jpeg">
                            </div>
                            <button class="play-button"></button>
                            <div class="writings">
                                <p>${e}</p>
                                <p>Artist</p>
                            </div>
                        </div>`;
        playlist.append(div);
    })    
    folderKaNaam=folderNames[0];
    await listing();
    let cards= playlist.querySelectorAll(".card");    
    
    cards.forEach((e)=>{
        e.addEventListener("click",(element)=>{
            let card=element.target.closest(".card");            
            folderKaNaam=card.querySelector("p").innerHTML;            
            (async () => {
                await listing();     
            })();    
        })
    })
    
    // handling the playsystem like playing, pausing, shadow etc.
    document.addEventListener("click", (e)=>{
        let element=null;
        if(e.target.closest("li")!=null){
            element=e.target.closest("li");
            if (currentShadowElement != null)
                currentShadowElement.classList.toggle("shadow");

            currentShadowElement = element;
            element.classList.toggle("shadow");                                    
            playMusic(element.querySelectorAll("p")[0].innerHTML, element);
        }
    })


    // handling the main playbutton
    playButton.addEventListener("click", () => {
        if (currentSong.src!='') {
            if (currentSong.paused) {
                currentSong.play();
                playButton.querySelector("img").src = `./svgs/pause.svg`;
                currentPauseElement.querySelectorAll("img")[1].src = `./svgs/pause.svg`;
            } else {
                currentSong.pause();
                playButton.querySelector("img").src = `./svgs/circlePlayWhite.svg`;
                currentPauseElement.querySelectorAll("img")[1].src = `./svgs/playButton.svg`;
            }
        }
    })

    // seek by clicking
    document.querySelector(".seekButton").addEventListener("click", (e) => {
        e.stopPropagation();
    })
    document.querySelector(".seekFiller").addEventListener("click", (e) => {
        e.stopPropagation();

        document.querySelector(".seekButton").style.left = `${e.offsetX}px`;
        document.querySelector(".seekFiller").style.width = `${e.offsetX}px`;
        let time = (e.offsetX / e.target.parentElement.getBoundingClientRect().width) * 100;
        currentSong.currentTime = (currentSong.duration * time) / 100;

    })
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".seekButton").style.left = `${e.offsetX}px`;
        document.querySelector(".seekFiller").style.width = `${e.offsetX}px`;

        let time = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        currentSong.currentTime = (currentSong.duration * time) / 100;
    })

    // bring back to initial when song is finished.
    currentSong.addEventListener("timeupdate", () => {
        if (currentSong.currentTime == currentSong.duration) {
            currentSong.currentTime = 0;
            document.querySelector(".seekButton").style.left = `0px`;
            document.querySelector(".seekFiller").style.width = `0px`;
            playButton.querySelector("img").src = `./svgs/circlePlayWhite.svg`;
            currentPauseElement.querySelectorAll("img")[1].src = `./svgs/playButton.svg`;
        }
    })


    // handling leftPlayButton and rightPlayButton.
    let leftPlayButton= document.querySelector(".leftPlayButton");
    let rightPlayButton = document.querySelector(".rightPlayButton");
    leftPlayButton.addEventListener("click",(e)=>{

        let currentSongIndex=-1;
        let name= decodeURI(currentSong.src.split(`/songs/${encodeURI(folderKaNaam)}/`)[1]);
        for (let index = 0; index < songNames.length; index++) {
            const element = songNames[index];
            if(element==name){
                currentSongIndex=index-1;
                break;
            }
        }
        if(currentSongIndex==-1) {
            currentSong.currentTime=0;
            currentSong.play();
        }else{
            let currentElement=ulTag.querySelectorAll('li')[currentSongIndex];
    
            if (currentShadowElement != null)
                currentShadowElement.classList.toggle("shadow");
    
            currentShadowElement = currentElement;
            currentShadowElement.scrollIntoView({ behavior: 'smooth' });
            currentElement.classList.toggle("shadow"); 
    
            playMusic(songNames[currentSongIndex], currentElement);
        }

    })

    rightPlayButton.addEventListener("click",(e)=>{
        let currentSongIndex=-1;
        let name= decodeURI(currentSong.src.split(`/songs/${encodeURI(folderKaNaam)}/`)[1]);
        for (let index = 0; index < songNames.length; index++) {
            const element = songNames[index];
            if(element==name){
                currentSongIndex=index+1;
                break;
            }
        }
        if(currentSongIndex==ulTag.querySelectorAll('li').length){
            currentSong.currentTime=0;
            currentSong.play();
        }else{
            let currentElement=ulTag.querySelectorAll('li')[currentSongIndex];
    
            if (currentShadowElement != null)
                currentShadowElement.classList.toggle("shadow");
    
            currentShadowElement = currentElement;
            currentShadowElement.scrollIntoView({ behavior: 'smooth' });
                        
            currentElement.classList.toggle("shadow"); 
            playMusic(songNames[currentSongIndex], currentElement);
        }
    })    
    
    let volumeButton=document.querySelector(".volume").querySelector("img");
    document.addEventListener("keydown", (e)=>{
        if(e.key=="m"){
            volumeButton.click();
        }
        if(e.code=="ArrowRight"){
            rightPlayButton.click();
        }
        if(e.code=="ArrowLeft"){
            leftPlayButton.click();
        }
        if(e.code=="Space"){            
            e.preventDefault();
            playButton.click();
        }
    })
    
    document.querySelector(".range").addEventListener("change",(e)=>{
        if(e.target.value!=0){
            volumeButton.src="./svgs/volume.svg";
        }
        if(e.target.value==0){
            volumeButton.src="./svgs/mute.svg";
        }
        currentSong.volume=parseInt(e.target.value)/100;
        currentVolume=parseInt(e.target.value)/100;
    })

    volumeButton.addEventListener("click", (e)=>{
        if(currentSong.volume==0){
            currentSong.volume=currentVolume;
            volumeButton.src="./svgs/volume.svg";
        }else{            
            volumeButton.src="./svgs/mute.svg";
            currentSong.volume=0;
        }
        
    })

}
main();



