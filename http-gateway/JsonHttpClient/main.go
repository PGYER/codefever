package jsonHttpClient

import (
	"fmt"
  	"io"
	"bytes"
	"net/http"
	"io/ioutil"
	"compress/gzip"
)

func Request(token string, method string, uri string, payload []byte) (int, []byte) {
	requestBody := bytes.NewBuffer(payload)
	request, err := http.NewRequest(method, uri, requestBody);

	if (err != nil) {
		fmt.Println(err.Error())
		return 0, nil
	}

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Content-Type", "application/json")
	request.Header.Add("token", token)

	client := &http.Client{};
	var body []byte

	response, err := client.Do(request)

	if (err != nil) {
		fmt.Println(err.Error())
		return 0, nil
	}

	defer response.Body.Close();

	switch response.Header.Get("Content-Encoding") {
		case "gzip":
			reader, _ := gzip.NewReader(response.Body)
			for {
				buf := make([]byte, 1024)
				n, err := reader.Read(buf)

				if err != nil && err != io.EOF {
					panic(err)
				}

				if n == 0 {
					break
				}
				body = append(body,buf...);
			}
		default:
			body, _ = ioutil.ReadAll(response.Body)
	}

	return response.StatusCode, body
}