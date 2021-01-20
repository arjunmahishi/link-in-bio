var params = new URLSearchParams(window.location.search);
const youtubePlaylistID = params.has('ytpid') ? params.get('ytpid') : "UU9eTgNyhtPaVf7h-YEo-R2w";
const youtubeMaxResult = "50";
const maxDisplay = 10;
const baseURL = "https://link-in-bio.vercel.app"; // prod
// const baseURL = "http://localhost:3000"; // dev

const CHANNELS = [
  {
    "name": "music",
    "youtubePlaylistID": "UU9eTgNyhtPaVf7h-YEo-R2w",
    "youtubeChannelID": "UC9eTgNyhtPaVf7h-YEo-R2w"
  },
  {
    "name": "tech",
    "youtubePlaylistID": "UUr1ZnTuLNaB6VGeb7W0Eb1g",
    "youtubeChannelID": "UCr1ZnTuLNaB6VGeb7W0Eb1g",
  }
]
var cardTemplate;

const getVideos = (playlistID, resp) => {
    let xhr = new XMLHttpRequest();
    xhr.open(
        'GET',
        `${baseURL}/api/youtube-videos?yt_playlist_id=${playlistID}&yt_max_results=${youtubeMaxResult}`
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
            card = card.replaceAll(`{{${attr}}}`, miniTitle[0]);
        }else{
            card = card.replaceAll(`{{${attr}}}`, video[attr]);
        }    
    }
    card = card.replaceAll(`{{}}`, video[attr]);
    return card
}

const handleChange = (e) => {
  CHANNELS.forEach(channel => {
    document.querySelector(`#${channel.name}-cards-holder`).innerHTML = "";
    displayCards(channel.name, channel.videos.filter((video) =>
        video.title.toLowerCase().includes(e.value.toLowerCase())));
  })
}

const displayCards = (channelName, videos) => {
  videos.slice(0,maxDisplay-1).forEach(video => {
      document.querySelector(`#${channelName}-cards-holder`).innerHTML += getCard(video);
  });
  document.querySelector(`#${channelName}-cards-holder`).style.visibility = "visible";
  document.querySelector("#loader").style.visibility = "hidden";
}

window.onload = function() {
  document.querySelectorAll(".card-list").forEach(list => {
    list.style.visibility = "hidden";
  })
  document.querySelector("#loader").style.visibility = "visible";
  cardTemplate = document.querySelector("#card-template").innerHTML;

  CHANNELS.forEach(channel => {
    document.querySelector("#cards-holder").innerHTML += `
      <section id="${channel.name}-cards-holder" class="card-list" ></section>        
    `
    getVideos(channel.youtubePlaylistID, videos => {
      channel["videos"] = videos;
      displayCards(channel.name, videos);
    });
  })
}
