package main

import (
    "log"
    "net/http"
    "./Request"
)

func main () {
    http.HandleFunc("/", Request.RequestHandler.ServeHTTP)
    err := http.ListenAndServe("localhost:27555", nil)
    if err != nil {
        log.Fatal("ListenAndServe: ", err.Error())
    }
}