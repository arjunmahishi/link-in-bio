package handler

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

type youtubeResponse struct {
	Items []struct {
		Snippet struct {
			Title      string `json:"title"`
			Thumbnails struct {
				Maxres struct {
					URL    string `json:"url"`
					Width  int    `json:"width"`
					Height int    `json:"height"`
				} `json:"maxres"`
			} `json:"thumbnails"`
			ResourceID struct {
				VideoID string `json:"videoId"`
			} `json:"resourceId"`
		} `json:"snippet"`
	} `json:"items"`
}

// Video represents the resource that this API would
// return as response
type Video struct {
	Title    string `json:"title"`
	URL      string `json:"url"`
	ThumbURL string `json:"thumb_url"`
}

var (
	baseURL    = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UU9eTgNyhtPaVf7h-YEo-R2w&key=%s&maxResults=%d"
	key        = os.Getenv("YOUTUBE_API_KEY")
	maxResults = 50
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// hit the youtube API
	resp, err := http.Get(fmt.Sprintf(baseURL, key, maxResults))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	// read and parse the response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	var parsedResp youtubeResponse
	if err := json.Unmarshal(body, &parsedResp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	// transform the response to a more generic struct
	videos := []Video{}
	for _, item := range parsedResp.Items {
		videos = append(videos, Video{
			Title:    item.Snippet.Title,
			URL:      "https://www.youtube.com/watch?v=" + item.Snippet.ResourceID.VideoID,
			ThumbURL: item.Snippet.Thumbnails.Maxres.URL,
		})
	}

	// marshal the response to a JSON string
	cleanJSON, _ := json.Marshal(videos)
	fmt.Fprintf(w, "%s", cleanJSON)
}
