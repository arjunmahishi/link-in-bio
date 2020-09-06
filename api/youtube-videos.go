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

type request struct {
	youtube struct {
		playlistID string
		maxResults string
	}
}

// Video represents the resource that this API would
// return as response
type Video struct {
	Title    string `json:"title"`
	URL      string `json:"url"`
	ThumbURL string `json:"thumb_url"`
}

var (
	baseURL          = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=%s&key=%s&maxResults=%s"
	key              = os.Getenv("YOUTUBE_API_KEY")
	defaultMaxResult = "10"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	req, err := parseRequest(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ytResponse, err := getVideos(req.youtube.playlistID, key, req.youtube.maxResults)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// transform the response to a more generic struct
	videos := []Video{}
	for _, item := range ytResponse.Items {
		videos = append(videos, Video{
			Title:    item.Snippet.Title,
			URL:      "https://www.youtube.com/watch?v=" + item.Snippet.ResourceID.VideoID,
			ThumbURL: item.Snippet.Thumbnails.Maxres.URL,
		})
	}

	if len(videos) == 0 {
		http.Error(w, "no videos found in the given playlist", http.StatusNotFound)
		return
	}

	// marshal the response to a JSON string
	cleanJSON, _ := json.Marshal(videos)
	fmt.Fprintf(w, "%s", cleanJSON)
}

func parseRequest(r *http.Request) (*request, error) {
	var (
		query = r.URL.Query()
		req   request
	)

	ytPlaylistID, ok := query["yt_playlist_id"]
	if !ok {
		return nil, fmt.Errorf("youtube playlist ID missing")
	}
	req.youtube.playlistID = ytPlaylistID[0]

	ytMaxResults, ok := query["yt_max_results"]
	if ok {
		req.youtube.maxResults = ytMaxResults[0]
		return &req, nil
	}
	req.youtube.maxResults = defaultMaxResult
	return &req, nil
}

func getVideos(playlistID, key, maxResults string) (*youtubeResponse, error) {
	// hit the youtube API
	resp, err := http.Get(fmt.Sprintf(baseURL, playlistID, key, maxResults))
	if err != nil {
		return nil, err
	}

	// read and parse the response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	var parsedResp youtubeResponse
	if err := json.Unmarshal(body, &parsedResp); err != nil {
		return nil, err
	}
	return &parsedResp, nil
}
