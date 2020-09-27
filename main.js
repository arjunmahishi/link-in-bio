var params = new URLSearchParams(window.location.search);
const youtubePlaylistID = params.has('ytpid') ? params.get('ytpid') : "UU9eTgNyhtPaVf7h-YEo-R2w";
const youtubeMaxResult = "50";
const maxDisplay = 10;
const baseURL = "https://link-in-bio.vercel.app"; // prod
// const baseURL = "http://localhost:3000"; // dev
var cardTemplate;

const getVideos = (resp) => {
    let xhr = new XMLHttpRequest();
    xhr.open(
        'GET', 
        `${baseURL}/api/youtube-videos?yt_playlist_id=${youtubePlaylistID}&yt_max_results=${youtubeMaxResult}`    
    );
    xhr.send();
    xhr.onload = function() {
        if (xhr.status != 200) {
            alert(`Error ${xhr.status}: ${xhr.responseText}`);
        } else {
            resp(JSON.parse(xhr.response))
        }
    };
}

const getCard = (video) => {   
    let card = cardTemplate
    for (attr in video) {       
        if(attr == 'title'){
            var miniTitle = video[attr].split('|');
            card = card.replace(`{{${attr}}}`, miniTitle[0]);
        }else{
            card = card.replace(`{{${attr}}}`, video[attr]);
        }        
    }
    return card
}

const handleChange = (e) => {
    document.querySelector("#cards-holder").innerHTML = "";
    displayCards(listOfVideo.filter((video) => 
        video.title.toLowerCase().includes(e.value.toLowerCase())));
}

const displayCards = (videos) => {
    videos.slice(0,maxDisplay-1).forEach(video => {
        document.querySelector("#cards-holder").innerHTML += getCard(video);
    });
    document.querySelector("#cards-holder").style.visibility = "visible"; 
    document.querySelector("#loader").style.visibility = "hidden";
}

var listOfVideo;
window.onload = function() {
    document.querySelector("#cards-holder").style.visibility = "hidden"; 
    document.querySelector("#loader").style.visibility = "visible";
    cardTemplate = document.querySelector("#card-template").innerHTML;
    getVideos(videos => {
        listOfVideo = videos;
        displayCards(videos);
    });    
}
