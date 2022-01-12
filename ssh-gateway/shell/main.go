package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"regexp"
	"io/ioutil"
	"path/filepath"
	"gopkg.in/yaml.v2"
	"encoding/json"
	"../JsonHttpClient"
)

type gateway struct {
	Token string `yaml:"token"`
	AuthServer string `yaml:"authSSH"`
}

type configType struct {
    Gateway gateway `yaml:"gateway"`
}

type RequestData struct {
	UserID string `json:"userID"`
	Repo string `json:"repo"`
	Action string `json:"action"`
}

type Payload struct {
	Uid string `json:"uid"`
	Path string `json:"path"`
	Action string `json:"action"`
}

type ResponseData struct {
	Code int `json:"code"`
	Message string `json:"message"`
	Data Payload `json:"data"`
}

func readConfig () configType {
  var conf configType
  // get current dir
  dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
  if err != nil {
    fmt.Println(err.Error())
  }

  // get yaml file content
  configData, err := ioutil.ReadFile(dir + "/../../env.yaml")
  if err != nil {
    fmt.Println(err.Error())
  }

  err = yaml.Unmarshal(configData, &conf)

  if err != nil {
    fmt.Println(err.Error())
  }

  return conf
}

var config configType

func init() {
	file := "./" + "message" + ".txt"
	logFile, err := os.OpenFile(file, os.O_RDWR | os.O_CREATE | os.O_APPEND, 0766)

	if err != nil {
		panic(err)
	}

	log.SetOutput(logFile)
	log.SetFlags(log.LstdFlags | log.Lshortfile | log.LUTC)
	return
}

func main () {
	// read yml config to global
	config = readConfig()

	if (len(os.Args) == 4) {
		pattern, _ := regexp.Compile(`^(git-(receive|upload)-pack)$`)
		sub := pattern.FindSubmatch([]byte(os.Args[1]))

		if (len(sub) > 1) {
			requestData, err := json.Marshal(RequestData{
				UserID: os.Args[3],
				Repo: os.Args[2],
				Action: string(sub[1]),
			})

			if (err != nil) {
				fmt.Println(err.Error())
				return
			}

			status, response := jsonHttpClient.Request(config.Gateway.Token, "GET", config.Gateway.AuthServer, requestData)

			responseData := &ResponseData{}
			err = json.Unmarshal(response, responseData)

			if (status != 200 || responseData.Code != 0) {
				return
			}

			os.Setenv("PGYER_UID", responseData.Data.Uid)

			cmd := exec.Command(os.Args[1], responseData.Data.Path)
			cmd.Stdin = os.Stdin
			cmd.Stdout = os.Stdout
			cmd.Stderr = os.Stderr

			err = cmd.Start()

			if (err != nil) {
				fmt.Println(err.Error())
				return
			}

			err = cmd.Wait()

			if (err != nil) {
				fmt.Println(err.Error())
				return
			}
		}
	}

	fmt.Println("[CodeFever Community]: Interaction shell is not allowed.")
	return
}
