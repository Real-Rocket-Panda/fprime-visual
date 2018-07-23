namespace Svc
 
component ActiveLogger {
    kind = active
    port LogRecv:Fw.Log {
        direction = in
        kind = sync
        number = 1..10
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
    events {
        event{
            id = 0
        }
    }
}