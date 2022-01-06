package Request

import (
    "fmt"
    "os"
    "regexp"
    "net/http"
    "net/http/httputil"
    "net/http/cgi"
    "io/ioutil"
    "path/filepath"
    "gopkg.in/yaml.v2"
    "encoding/json"
    "../JsonHttpClient"
)

type cli struct {
    Cgipath string `yaml:"http"`
}

type gateway struct {
    Token string `yaml:"token"`
    AuthServer string `yaml:"authHTTP"`
    Repopath string
}

type configType struct {
    Gateway gateway `yaml:"gateway"`
    Cli cli `yaml:"cli"`
}

type RequestData struct {
    User string `json:"user"`
    Pass string `json:"pass"`
    Repo string `json:"repo"`
    Action string `json:"action"`
}

type Payload struct {
    Storage string `json:"storage"`
    Uid string `json:"uid"`
    User string `json:"user"`
    Addr string `json:"addr"`
    Path string `json:"path"`
}

type ResponseData struct {
    Code int `json:"code"`
    Message string `json:"message"`
    Data Payload `json:"data"`
}

type Handler struct {}

type DebugTransport struct{}

func (DebugTransport) RoundTrip(r *http.Request) (*http.Response, error) {
    b, err := httputil.DumpRequestOut(r, false)
    if err != nil {
        return nil, err
    }
    fmt.Println(string(b))
    return http.DefaultTransport.RoundTrip(r)
}

func readConfig () configType {
    var conf configType
    // get current dir
    dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
    if err != nil {
        fmt.Println(err.Error())
    }

    // get yaml file content
    configData, err := ioutil.ReadFile(dir + "/../env.yaml")
    if err != nil {
        fmt.Println(err.Error())
    }

    err = yaml.Unmarshal(configData, &conf)

    if err != nil {
        fmt.Println(err.Error())
    }

    conf.Gateway.Repopath = dir + "/../git-storage"
    return conf
}

var config configType

func (t Handler) ServeHTTP (response http.ResponseWriter, request *http.Request) {

    fmt.Println("In comming: " + request.Method)
    fmt.Println(request.URL)

    // user agent check
    userAgent := request.Header["User-Agent"][0]
    userAgentPattern, _ := regexp.Compile(`^(git)(.*)$`)
    userAgentSub := userAgentPattern.FindSubmatch([]byte(userAgent))

    if (len(userAgentSub) == 0) {
        response.Header().Set("Location", "https://codefever.pgyer.com")
        response.WriteHeader(302)
        return
    }

    user, pass, ok := request.BasicAuth()

    if (!ok) {
        response.Header().Set("WWW-Authenticate", `Basic realm="Git User Login"`)
        response.WriteHeader(401)
        return
    }

    config = readConfig()

    handler := new(cgi.Handler)
    handler.Path = config.Cli.Cgipath
    handler.Dir = config.Gateway.Repopath

    pattern, _ := regexp.Compile(`^([a-zA-z0-9\/\.-]+\.git)(.*)$`)
    sub := pattern.FindSubmatch([]byte(request.URL.Path))

    // from user
    if (len(sub) > 1) {
        request.URL.Path = string(sub[2])
        requestData, err := json.Marshal(RequestData{
            User: user,
            Pass: pass,
            Repo: string(sub[1]),
            Action: request.URL.Query().Get("service"),
        })

        if (err != nil) {
            fmt.Println(err.Error())
            return
        }

        status, authResponse := jsonHttpClient.Request(config.Gateway.Token, "GET", config.Gateway.AuthServer, requestData)

        responseData := &ResponseData{}
        err = json.Unmarshal(authResponse, responseData)

        if (status != 200 || responseData.Code != 0) {
            if (status != 404) {
                status = 401
            }

            response.WriteHeader(status)
            return
        }

        fmt.Println("Get repo: " + responseData.Data.Path)
        fmt.Println("Get repo user: " + responseData.Data.User + "[@]" + responseData.Data.Addr)

        handler.Env = append(handler.Env, "GIT_PROJECT_ROOT=" + responseData.Data.Path)
        handler.Env = append(handler.Env, "REMOTE_USER=" + responseData.Data.User)
        handler.Env = append(handler.Env, "REMOTE_ADDR=" + responseData.Data.Addr)
        handler.Env = append(handler.Env, "PGYER_UID=" + responseData.Data.Uid)
    } else {
        // from internal
        pattern, _ := regexp.Compile(`^([^@]+)@([^@]+)$`)
        sub := pattern.FindSubmatch([]byte(user))

        if (len(sub) == 0) {
            response.WriteHeader(404)
            return
        }

        fmt.Println("Get repo: (internal using URL)")
        fmt.Println("Get repo user: (internal using URL)" + string(sub[1]) + "[@]" + string(sub[2]))

        handler.Env = append(handler.Env, "GIT_PROJECT_ROOT=" + config.Gateway.Repopath)
        handler.Env = append(handler.Env, "REMOTE_USER=" + string(sub[1]))
        handler.Env = append(handler.Env, "REMOTE_ADDR=" + string(sub[2]))
        handler.Env = append(handler.Env, "PGYER_UID=" + pass)
        handler.Env = append(handler.Env, "PGYER_ACTION=1")
    }

    handler.Env = append(handler.Env, "GIT_HTTP_EXPORT_ALL=")

    request.Header.Del("REMOTE_USER")
    request.Header.Del("REMOTE_ADDR")
    request.Header.Del("PGYER-REPO")
    request.Header.Del("PGYER-REPO-USER")
    request.Header.Del("PGYER-REPO-ADDR")

    handler.ServeHTTP(response, request)
}

var RequestHandler Handler