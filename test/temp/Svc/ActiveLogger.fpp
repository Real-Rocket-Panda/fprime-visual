namespace Svc

component ActiveLogger {
    port LogRecv:Fw.Log {
        direction = in
        kind = sync
        max_number = 10
        min_number = 1
    }
    port PktSend:Fw.Com {
        direction = out
    }
    port FatalAnnounce:Svc.FatalEvent {
        direction = out
    }
    port pingIn:Svc.Ping {
        direction = in
        kind = async
    }
    port pingOut:Svc.Ping {
        direction = out
    }
    port LogText:Fw.LogText {
        direction = out
        role = LogTextEvent
    }
    port Log:Fw.Log {
        direction = out
        role = LogEvent
    }
}