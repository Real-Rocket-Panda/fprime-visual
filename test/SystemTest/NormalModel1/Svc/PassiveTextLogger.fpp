namespace Svc
 
component PassiveTextLogger {
    kind = passive
    port TextLogger:Fw.LogText {
        direction = in
        kind = sync
        number = 1..10
    }
}