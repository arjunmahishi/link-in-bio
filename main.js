var cardTemplate;

const getVideos = (resp) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://link-in-bio.vercel.app/api/youtube-videos');
    xhr.send();
    xhr.onload = function() {
        if (xhr.status != 200) {
            alert(`Error ${xhr.status}: ${xhr.statusText}`);
        } else {
            resp(JSON.parse(xhr.response))
        }
    };
}

const getCard = (video) => {
    let card = cardTemplate
    for (attr in video) {
        card = card.replace(`{{${attr}}}`, video[attr])
    }
    return card
}

const handleChange = (e) => {
    document.querySelector("#cards-holder").innerHTML = "";
    displayCards(listOfVideo.filter((video) => 
        video.title.toLowerCase().includes(e.value.toLowerCase())));
}

const displayCards = (videos) => {
    videos.slice(0,9).forEach(video => {
        document.querySelector("#cards-holder").innerHTML += getCard(video);
    });
}

var listOfVideo;
window.onload = function() {
    cardTemplate = document.querySelector("#card-template").innerHTML;
    getVideos(videos => {
        listOfVideo = videos;
        displayCards(videos);
    });
}
