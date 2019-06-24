namespace Svc

component PassiveTextLogger {
    port TextLogger:Fw.LogText {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
    }
}